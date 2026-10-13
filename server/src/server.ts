import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { ENV_CONFIG } from "./config/env.js";

app.listen(Number(ENV_CONFIG.PORT), ()=>{
    connectDatabase();
    console.log(`Server is running on port ${ENV_CONFIG.PORT}`);
})