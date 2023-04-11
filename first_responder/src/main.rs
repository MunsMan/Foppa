use actix_web::middleware::Logger;
use actix_web::{
    get, post,
    web::{Data, Json, Path},
    App, HttpResponse, HttpServer, Responder, Result,
};
use chrono;
use dotenv::dotenv;
use kafka::client::metadata::Broker;
use kafka::client::KafkaClient;
use kafka::producer::{Producer, Record};
use redis::Commands;
use serde::Serialize;
use std::sync::Mutex;

const REDIS_CONNECTION_STRING: &str = "redis://:redis_password@localhost/";
const KAFKA_HOST: &str = "127.0.0.1:9092";

#[derive(Serialize)]
struct TriggerResponse {
    execution_id: String,
    timestamp: String,
}

#[derive(Serialize)]
struct OptimizerInput {
    execution_id: String,
    function_id: String,
    username: String,
}

struct SharedData {
    redis_client: redis::Client,
    kafka_client: Mutex<Producer>,
}

#[post("/{username}/{function_id}")]
async fn post_trigger_function(
    path: Path<(String, String)>,
    _body: String,
) -> Result<impl Responder> {
    let (username, function_id) = path.into_inner();
    println!("Call from User: {username} for Function: {function_id}");
    let obj = TriggerResponse {
        execution_id: "abc".to_string(),
        timestamp: chrono::offset::Local::now().to_string(),
    };
    Ok(Json(obj))
}

#[get("/{username}/{function_id}")]
async fn get_trigger_function(
    path: Path<(String, String)>,
    data: Data<SharedData>,
) -> impl Responder {
    let (username, function_id) = path.into_inner();
    println!("Call from User: {username} for Function: {function_id}");
    let mut redis: redis::Connection = data
        .redis_client
        .get_connection()
        .expect("Unable to get Connection");
    let key = format!("fid:{username}/{function_id}");
    let exist: i64 = redis.exists(&key).unwrap();
    if exist == 0 {
        eprintln!("Function does not exist");
        return HttpResponse::BadRequest()
            .content_type("text/plain")
            .body("Unknown Function Id");
    }
    let execution_id: i64 = redis.incr(&key, 1).unwrap();
    let result = OptimizerInput {
        execution_id: execution_id.to_string(),
        function_id,
        username,
    };
    let record = Record::from_key_value(
        "optimizer-input",
        result.function_id.clone(),
        bincode::serialize(&result).unwrap(),
    );
    data.kafka_client.lock().unwrap().send(&record).unwrap();
    let obj = TriggerResponse {
        execution_id: execution_id.to_string(),
        timestamp: chrono::offset::Local::now().to_string(),
    };
    HttpResponse::Ok().json(Json(obj))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();
    let redis_client =
        redis::Client::open(REDIS_CONNECTION_STRING).expect("Unable to open client connection");

    let mut kafka_client = KafkaClient::new(vec![KAFKA_HOST.to_string()]);
    kafka_client.load_metadata_all().unwrap();
    for topic in kafka_client.topics() {
        for partition in topic.partitions() {
            println!(
                "{} #{} => {}",
                topic.name(),
                partition.id(),
                partition.leader().map(Broker::host).unwrap_or("no-leader!")
            );
        }
    }
    let mut kafka_client = KafkaClient::new(vec![KAFKA_HOST.to_string()]);
    kafka_client.load_metadata_all().unwrap();

    let producer = Producer::from_client(kafka_client).create().unwrap();
    let shared_data = Data::new(SharedData {
        redis_client,
        kafka_client: Mutex::new(producer),
    });

    HttpServer::new(move || {
        let logger = Logger::default();
        App::new()
            .wrap(logger)
            .app_data(shared_data.clone())
            .service(get_trigger_function)
    })
    .bind(("127.0.0.1", 3000))?
    .run()
    .await
}
