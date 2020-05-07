const {sequelize} = require("./views/base");
const TestJobView = require("./views/test_job");

module.exports = {
    sequelize,
    TestJob: new TestJobView()
};