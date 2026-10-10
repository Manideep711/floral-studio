import {existsSync} from "node:fs";
import {loadEnvFile} from "node:process";
import {checkDeploymentEnvironment} from "../src/lib/deployment/environment";
// Match production dotenv precedence; existing host environment takes priority.
for(const file of [".env.production.local",".env.local",".env.production",".env"])if(existsSync(file))loadEnvFile(file);
try{
 const mode=checkDeploymentEnvironment(process.env);
 console.log(mode==="live" ? "Supabase public build configuration checked. Live connectivity still needs verification." : "Supabase is unset: this build will use the sample garden.");
}catch(error){console.error(error instanceof Error ? error.message : "Invalid deployment environment.");process.exitCode=1;}
