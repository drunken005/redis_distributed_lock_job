# 采用redis分布式锁解决nodejs 定时任务集群并发的问题

#### mysql
```sql
DROP TABLE IF EXISTS `test_job`;
CREATE TABLE `test_job` ( 
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'id', 
    `name` varchar(128) DEFAULT NULL COMMENT 'name',
    `status` tinyint(4) unsigned NOT NULL DEFAULT '1' COMMENT 'status',
    `pid` varchar(128) DEFAULT NULL COMMENT 'pid',
     PRIMARY KEY (`id`))
COMMENT='test_job';
```

#### 初始化数据
```bash
node insert.js
```

#### 配置和启动服务
采用pm2启动多个应用实例，当前配置是2个，可在`start.config.js`中配置`instances`

* 启动服务
```bash
npm run start
```

* 停止服务
```bash
npm run stop
```

支持redis集群
