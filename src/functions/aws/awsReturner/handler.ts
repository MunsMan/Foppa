const awsReturner = async (event: any) => {
    console.log(event)
    console.log('Framework Metadata:', event.requestPayload.metadata)
    console.log('Return Value:', event.responsePayload)
};

export const main = awsReturner;
