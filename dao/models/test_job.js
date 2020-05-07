module.exports = function (sequelize, DataTypes) {
    return sequelize.define("testJob", {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: "id",
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "name",
        },
        status: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 1,
            field: "status",
        },
        pid: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "pid",
        }
    }, {
        tableName: "test_job",
    });
};