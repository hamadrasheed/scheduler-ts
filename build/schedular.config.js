module.exports = {
    apps : [{
      name: 'SCHEDULER',
      script: 'app.js',
      watch: false,
      exec_mode : "cluster",
      instances: 4,
      max_memory_restart: '12G',
      node_args: "--max_old_space_size=16384",
      out_file: "/dev/null",
      error_file: "/dev/null"
    }]
  }
