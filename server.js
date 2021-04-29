/*********************************************************************************
 ** WEB700 – Assignment 06 
 ** I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
 ** assignment has been copied manually or electronically from any other source (including web sites) or
 ** distributed to other students. * * Name: Mahshid Farrahinia Student ID: 144091196 Date:4/12/2020
 ** Online (Heroku) Link:  https://peaceful-hollows-69070.herokuapp.com/ | https://git.heroku.com/peaceful-hollows-69070.git
 * ********************************************************************************/
const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url === app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue !== rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');


app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

let serverDataModule = require("./modules/serverDataModule");

serverDataModule.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("Server listening on port :" + HTTP_PORT)
    })
});

app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route === "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.get("/employees", (req, res) => {
    if (req.query.department) {
        serverDataModule.getEmployeesByDepartment(req.query.department).then((employees) => {
            if (employees.length > 0) {
                res.render('employees', {employees});
            } else {
                res.render("employees", {message: "no results"});
            }
        }).catch((err) => {
            res.render("employees", {message: "no results"});
        });
    } else {
        serverDataModule.getAllEmployees().then((employees) => {
            if (employees.length > 0) {
                res.render('employees', {
                    employees
                });
            } else {
                res.render("employees", {message: "no results"});
            }
        }).catch((err) => {
            res.render("employees", {message: "no results"});
        });
    }
});

app.get("/managers", (req, res) => {
    serverDataModule.getManagers().then((resp) => {
        res.json(resp)
    }).catch((err) => {
        res.send(err);
    });
});

app.get("/employee/:num", (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    serverDataModule.getEmployeeByNum(req.params.num).then((employee) => {
        if (employee) {
            viewData.employee = employee[0]; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }

    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error
    }).then(serverDataModule.getDepartments)
        .then((departments) => {
            viewData.departments = departments; // store department data in the "viewData" object as "departments"
            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching
            // viewData.departments object
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId === viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee === null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
            res.render("employee", {viewData: viewData}); // render the "employee" view
        }
    });
});

app.post("/employee/update", (req, res) => {
    serverDataModule.updateEmployee(req.body).then((resp) => {
        res.redirect("/employees");
    }).catch((err) => {
        res.send(err);
    });
});

app.get("/department/add", (req, res) => {
    res.render("addDepartment");
});

app.post("/department/add", (req, res) => {
    serverDataModule.addDepartment(req.body).then((response) => {
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to Add Department");
    });
});

app.get("/department/:id", (req, res) => {
    serverDataModule.getDepartmentById(req.params.id).then((department) => {
        if (department === 'undefined') {
            res.status(404).send("Department Not Found")
        } else {
            res.render("department", {department})
        }
    }).catch((err) => {
        res.send(err);
    });
});

app.get("/departments/delete/:id", (req, res) => {
    serverDataModule.deleteDepartmentById(req.params.id).then((response) => {
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Department / Department not found)")
    });
});

app.get("/employee/delete/:id", (req, res) => {

    serverDataModule.deleteEmployeeByNum(req.params.id).then(() => {
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to Remove employee / employee not found)")
    });
});

app.get("/departments", (req, res) => {
    serverDataModule.getDepartments().then((departments) => {
        if (departments.length > 0) {

            res.render('departments', {
                departments
            });
        } else {
            res.render("departments", {message: "no results"});
        }
    }).catch(() => {
        res.render("departments", {message: "no results.!"});
    });
});

app.post("/department/update", (req, res) => {
    serverDataModule.updateDepartment(req.body).then((department) => {
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to Update department");
    });
});

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render('about');
});

app.get("/htmlDemo", (req, res) => {
    res.render("htmlDemo");
});

app.get("/employees/add", (req, res) => {
    serverDataModule.getDepartments().then((departments) => {
        res.render("addEmployee", {departments});
    }).catch(() => {
        res.render("addEmployee", {departments: []});

    });

});

app.post("/employees/add", (req, res) => {
    serverDataModule.addEmployee(req.body).then((response) => {
        res.redirect("/employees");
    }).catch(() => {
        res.status(500).send("Unable to Add Employee");
    });
});

app.use((req, res) => {
    res.status(404).sendfile(path.join(__dirname, "./views/htmlDemo.hbs"));
});
  
  

