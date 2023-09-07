import { BACKEND_URL } from '$env/static/private';
import type { regions } from '$lib/aws/constants';

type Provider = 'aws';
type Region = (typeof regions)[number];

type PostService = 'login' | 'signIn' | 'create';
type GetService = 'function' | 'functions';

interface LoginResponse {
	status: 'wrong' | 'valid' | 'notFound';
	username: string;
}
interface SignInResponse {
	status: 'created' | 'alreadyExists';
	username: string;
}

export interface FunctionResponse {
	functionId: string;
	regions: {
		region: Region;
		provider: Provider;
		regionExecutionCount: number;
	}[];
	functionName: string;
	executionCounter: number;
}

interface FunctionsResponse {
	username: string;
	functions: {
		functionId: string;
		functionName: string;
		executionCouter: string;
	}[];
}

interface CreateResponse {
	message: string;
	functionId: string;
}

type PostServiceUrl<T extends PostService> = T extends 'login'
	? 'login'
	: T extends 'signIn'
	? 'signIn'
	: T extends 'create'
	? `create/${string}`
	: never;

type PostServiceBody<T extends PostService> = T extends 'login'
	? { username: string; password: string }
	: T extends 'signIn'
	? { username: string; password: string }
	: T extends 'create'
	? {
			region: string;
			runtime: string;
			role: string;
			handler: string;
			zip_file: string;
			functionName: string;
	  }
	: never;

type PostServiceResponse<T extends PostService> = T extends 'login'
	? LoginResponse
	: T extends 'signIn'
	? SignInResponse
	: T extends 'create'
	? CreateResponse
	: never;

const headers = { 'Content-Type': 'application/json' };

export const postService = async <T extends PostService>(
	url: PostServiceUrl<T>,
	body: PostServiceBody<T>
) => {
	const response = await fetch(`${BACKEND_URL}/${url}`, {
		method: 'POST',
		headers,
		body: JSON.stringify(body)
	});
	return response.json() as unknown as PostServiceResponse<T>;
};

type GetServiceUrl<T extends GetService> = T extends 'function'
	? `function/${string}/${string}`
	: T extends 'functions'
	? `function/${string}`
	: never;

type GetServiceResponse<T extends GetService> = T extends 'function'
	? FunctionResponse
	: T extends 'functions'
	? FunctionsResponse
	: never;

export const getService = async <T extends GetService>(url: GetServiceUrl<T>) => {
	const response = await fetch(`${BACKEND_URL}/${url}`, {
		headers
	});
	return response.json() as unknown as GetServiceResponse<T>;
};
