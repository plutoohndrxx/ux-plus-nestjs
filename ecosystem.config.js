module.exports = {
    apps: [
      {
        name: '@ux-plus/nestjs',
        script: './dist/main.js', // 注意这里的路径需要指向编译后的 main.js 文件
        instances: 'max', // 自动检测CPU核心数并创建对应数量的工作进程
        exec_mode: 'cluster', // 开启Cluster模式
        env: {
          NODE_ENV: 'production',
          PORT: 3000,
        },
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        error_file: '/logs/my-app-error.log',
        out_file: '/logs/my-app-out.log',
        merge_logs: true,
        watch: false, // 是否监听文件变化自动重启，默认false
        stop_exit_codes: [0] // 故障重启
      },
    ],
};