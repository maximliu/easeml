"use strict";

//let common = require("./common");
import common from "./common";
import decamelizeKeys from "decamelize-keys";

import moment from "moment";
let momentDurationFormatSetup = require("moment-duration-format"); 
momentDurationFormatSetup(moment);

function transformDataItem(input) {

    let creationTime = new Date(input["creation-time"]);
    let runningDuration = moment.duration(input["running-duration"], "milliseconds");

    return {
        id: input.id,
        link: "#/jobs/"+input.id, // TODO: Move this elsewhere.
        user: input.user,
        dataset: input.dataset,
        models: input.models,
        objective: input.objective,
        maxTasks: input["max-tasks"],
        creationTime: creationTime,
        creationTimeString: creationTime.toLocaleString(),
        runningDuration: runningDuration,
        runningDurationString: runningDuration.format(),
        status: input.status
    };
}

function getJobs(query) {
    
    // This allows us to accept camel case keys.
    query = decamelizeKeys(query || {}, "-");

    // Run query and collect results as a promise.
    return new Promise((resolve, reject) => {

        common.runGetQuery(this.axiosInstance, "/jobs", query)
        .then(data => {

            let items = [];

            if (data) {
                for (let i = 0; i < data.length; i++) {
                    items.push(transformDataItem(data[i]));
                }
            }

            resolve(items);

        })
        .catch(e => {
            reject(e);
        });
    });
}

function getJobById(id) {

    // Run query and collect results as a promise.
    return new Promise((resolve, reject) => {

        this.axiosInstance.get("/jobs/"+id)
        .then(response => {
            let result = transformDataItem(response.data.data);
            resolve(result);
        })
        .catch(e => {
            reject(e);
        });
    });

}

function validateJobFields(input) {

    input = decamelizeKeys(input, "-");
    let errors = {};

    if (!input.dataset) {
        errors["dataset"] = "The dataset must be specified.";
    }

    if (!input.objective) {
        errors["objective"] = "The objective must be specified.";
    }

    if (!input.models) {
        errors["models"] = "The models list must be specified and cannot be empty.";
    }

    return errors;
}

function createJob(input) {

    // Collect fields of interest.
    input = decamelizeKeys(input, "-");
    let data = {
        "dataset" : input["dataset"],
        "objective" : input["objective"],
        "alt-objectives" : input["alt-objectives"] || [],
        "models" : input["models"],
        "accept-new-models" : input["accept-new-models"] == true,
        "max-tasks" : Number(input["max-tasks"]),
    }

    // Run post request as a promise.
    return new Promise((resolve, reject) => {
        this.axiosInstance.post("/jobs", data)
        .then(result => {
            let id = result.headers.location;
            id = id.substr(id.lastIndexOf("/")+1);

            // We return the ID of the new created object.
            resolve(id);
        })
        .catch(e => {
            reject(e);
        });
    });
}

function updateJob(id, updates) {
    // Collect fields of interest.
    updates = decamelizeKeys(updates, "-");
    let data = {};
    if ("max-tasks" in updates) {
        data["max-tasks"] = updates["max-tasks"];
    }
    if ("accept-new-models" in updates) {
        data["accept-new-models"] = updates["accept-new-models"];
    }
    if ("status" in updates) {
        data["status"] = updates["status"];
    }

    // Run patch request as a promise.
    return new Promise((resolve, reject) => {
        this.axiosInstance.patch("/jobs/"+id, data)
        .then(result => {
            resolve();
        })
        .catch(e => {
            reject(e);
        });
    });
}

export default {
    getJobs: getJobs,
    getJobById: getJobById,
    validateJobFields: validateJobFields,
    createJob: createJob,
    updateJob: updateJob
};
