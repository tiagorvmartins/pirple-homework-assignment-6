/*
 * Create and export configuration variables
 *
 */

 // Container of all the environments
 var environments = {};

 // Staging (default) environment
 environments.staging = {
   'httpPort': 4000,
   'httpsPort': 4001,
   'envName': 'staging',
   'serverListenCpuCoresAmount': 0 //0 in order to use all available in the local machine
 };

 // Production environments
 environments.production = {
   'httpPort': 9000,
   'httpsPort': 9001,
   'envName': 'production',
   'serverListenCpuCoresAmount': 0 //0 in order to use all available in the local machine
 };

 // Determine which environment was passed as a command-line argument
 var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

 // Check that the current environment is one of the environments above, if not, default to staging
 var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

 // Export the module
 module.exports = environmentToExport;
