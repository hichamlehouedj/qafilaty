module.exports = {
    apps : [
        {
            name: "Qafilaty",
            script: "./src/app.mjs",
            //exec_mode: "cluster",
            source_map_support: true,

            // Watch Options
            ignore_watch: ["[\/\\]\./", "node_modules", ".PM2"],
            watch: false,
            
            // Log files
            error_file: "/www/wwwroot/api.qafilaty.com/.PM2/Api_err.log",
            out_file: "/www/wwwroot/api.qafilaty.com/.PM2/Api_out.log",
            combine_logs: true,
            merge_logs: true,
            pid_file: "/www/wwwroot/api_dev.qafilaty.com/.PM2/Api_id.pid",
            
            // Env Options
            env: {
                "NODE_ENV": "production",
            },
            production_env: {
                "NODE_ENV": "production",
            },
            env_development: {
               "NODE_ENV": "development"
            }
        }
    ]
}