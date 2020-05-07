const {BaseView}            = require("./base");
const TestJobModel = require("../models/test_job");

class TestJobView extends BaseView {
    constructor() {
        super(TestJobModel);
    }
}


module.exports = TestJobView;