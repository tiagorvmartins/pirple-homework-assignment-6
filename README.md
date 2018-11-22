# pirple-homework-assignment-6
This is my public repo for the Pirple Homework Assignment #6

Simple project that serves an API at /hello using several CPU cores (using the cluster lib), returning a simple JSON block to the user, like the following:

``` json
{
    "WelcomeMessage": "Hello you successfuly reached my 'hello' endpoint. Have a nice day, thank you.",
    "StatusCode": "200",
    "YourRequestData": {
        "trimmedPath": "hello",
        "queryStringObject": {},
        "method": "get",
        "headers": {
            "cache-control": "no-cache",
            "postman-token": "2e5ba52c-3f09-4a7b-bb54-a1d102055dbb",
            "user-agent": "PostmanRuntime/7.4.0",
            "accept": "*/*",
            "host": "localhost:4000",
            "accept-encoding": "gzip, deflate",
            "connection": "keep-alive"
        },
        "payload": ""
    }
}
```

The amount of CPU cores to use is configurable in the config.js file.
In order to use all the available cores of the machine just insert use the number zero (0).
To run the project just type 'node index'.
