const Sequelize = require('sequelize');
var sequelize = new Sequelize('da3jvamimjkaov', 'logqclshjybyuq', '391844388548dfd2691274a140c742255f57669399de025b06972d62becf2aae', {
    host: 'ec2-34-204-22-76.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: {rejectUnauthorized: false}
    }
});

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING,
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

Department.hasMany(Employee, {foreignKey: 'department'});

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(() => {
            console.log("Connected to database was successful");
            resolve(true)
        }).catch((error) => {
            console.log("Connected to database was not successful");
            console.log(error);
            reject("unable to sync the database")
        })
    });
};

module.exports.getAllEmployees = function () {
    return new Promise(function (resolve, reject) {
        Employee.findAll().then((employees) => {
            employees = employees.map(value => value.dataValues);
            resolve(employees);
        }).catch((error) => {
            reject("no results returned");
        });
    });
}

module.exports.getManagers = function () {
    return new Promise(function (resolve, reject) {
        reject();
    });
};

module.exports.getDepartments = function () {
    return new Promise(function (resolve, reject) {
        Department.findAll().then((departments) => {
            departments = departments.map(value => value.dataValues);
            resolve(departments);
        }).catch((error) => {
            reject("no results returned");
        });
    });
}

module.exports.getEmployeesByDepartment = function (department) {

    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                department: department
            }
        }).then((employees) => {
            employees = employees.map(value => value.dataValues);

            resolve(employees);
        }).catch((error) => {
            reject("no results returned");
        });
    });
};

module.exports.getEmployeeByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                employeeNum: num
            }
        }).then((employees) => {
            employees = employees.map(value => value.dataValues);
            resolve(employees);
        }).catch((error) => {
            reject("no results returned");
        });
    });
};

module.exports.getDepartmentById = function (id) {
    return new Promise(function (resolve, reject) {
        Department.findAll({
            where: {
                departmentId: id
            }
        }).then((department) => {
            department = department.map(value => value.dataValues);
            resolve(department);
        }).catch((error) => {
            reject("no results returned");
        });
    });
};

module.exports.updateEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager === 'on') ? true : false;

        Object.keys(employeeData).forEach(key => {
            if (!employeeData[key]) {
                employeeData[key] = null;
            }
        });

        Employee.update({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            hireDate: employeeData.hireDate,

        },{
            where:{employeeNum:employeeData.employeeNum}
        }).then(() => {
            resolve(true)
        }).catch(() => {
            reject("unable to update employee")
        });
    });
};

module.exports.addEmployee = function (employeeData) {

    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager === 'on') ? true : false;

        Object.keys(employeeData).forEach(key => {
            if (!employeeData[key]) {
                employeeData[key] = null;
            }
        });


        Employee.create({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            hireDate: employeeData.hireDate,
            department: employeeData.department,

        }).then(() => {
            resolve(true)
        }).catch(error => {
            reject("unable to create employee , error = "+ error)
        });
    });
};

module.exports.addDepartment = function (departmentData) {
    return new Promise(function (resolve, reject) {

        Object.keys(departmentData).forEach(key => {
            if (!departmentData[key]) {
                departmentData[key] = null;
            }
        });

        Department.create({
            departmentName: departmentData.departmentName,

        }).then(department => {
            resolve(true)
        }).catch(error => {
            reject("unable to create department")
        });
    });
};

module.exports.updateDepartment = function (departmentData) {
    return new Promise(function (resolve, reject) {

        Object.keys(departmentData).forEach(key => {
            if (!departmentData[key]) {
                departmentData[key] = null;
            }
        });

        Department.update({
            departmentName: departmentData.departmentName,

        },{
            where:{departmentId:departmentData.departmentId}
        }).then(department => {
            resolve(true)
        }).catch(error => {
            reject("unable to update department")
        });
    });
};

module.exports.deleteDepartmentById = function (id) {
    return new Promise(function (resolve, reject) {
        Department.destroy({ // delete form departments where id = 1
            where: {departmentId:id},
        }).then(() => {
            resolve(true)
        }).catch(() => {
            reject("unable to delete department")
        });
    });
};


module.exports.deleteEmployeeByNum = function (empNum) {
    return new Promise(function (resolve, reject) {
        Employee.destroy({
            where: {employeeNum:empNum},
        }).then(() => {
            resolve(true)
        }).catch(() => {
            reject("unable to delete employee")
        });
    });
};