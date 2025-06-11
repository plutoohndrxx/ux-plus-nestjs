├─databases 数据库
│  ├─mongodb
│  │  └─schemas
│  └─mysql-database
│      ├─interfaces
│      └─model
├─dto 公共的DTO以及响应工具
├─exceptions 
│  └─validate-dto
├─filter 过滤器
│  └─http-exception
├─guards 守卫
│  ├─auth-token token守卫
│  └─is-provide-service 过载保护 
├─interceptors 拦截器
│  └─xss-sanitize xss过滤器
├─middleware 中间件
│  └─uniform-response-header 统一响应格式 content-type 
├─modules 基本模块
│  ├─cpu-overload-protection CPU过载保护
│  ├─env-config 
│  ├─redis
│  │  ├─tests
│  │  └─types
│  ├─store 基础的状态库（基于内存）
│  │  └─tests 
│  ├─ux-jwt JWT
│  │  └─tests
│  └─ux-password 密码加密、解密
├─plugins 基本的插件
├─routes 路由模块
│  ├─auth 
│  │  ├─dto
│  │  └─tests
│  ├─registry 
│  │  ├─dto
│  │  ├─tests
│  │  └─types
│  └─registry-code
│      ├─dto
│      └─tests
├─services 单一service
│  ├─email 邮箱服务
│  └─ux-crypto-rsa RSA加密
├─test-tools 测试工具
└─tools 基本工具
    └─tests