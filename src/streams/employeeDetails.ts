import { query } from "../../lib/db";
import { Stream, streamsToProps } from "../streams";

const stream: Stream = {
    ttl: 0,
    fallback: [],
    getData: async (context) => {
        return new Promise(resolve => {
            const promises = [];
            promises.push(new Promise(resolve => {
                query("SELECT employee.*, `rank`.`name` AS rank_name, color FROM employee INNER JOIN `rank` ON `employee`.`rank_id` = `rank`.`rank_id` WHERE employee_id = ? LIMIT 1", context.req.query?.id).then(result => {
                    const ret = result[0];
                    ret.priv = JSON.parse(ret.access_blob);
                    resolve({ key: "basic", value: result[0] });
                });
            }));
            promises.push(new Promise(resolve => {
                query("SELECT employee_qualification.*, UNIX_TIMESTAMP(employee_qualification.entry_date) AS entry_date, qualification.`name`, employee.`name` AS trainer_name FROM employee_qualification INNER JOIN qualification ON `employee_qualification`.`qualification_id` = `qualification`.`qualification_id` INNER JOIN employee ON `employee`.`employee_id` = `employee_qualification`.`trainer_id` WHERE receiver_id = ?", context.req.query?.id).then(result => {
                    resolve({ key: "qualifications", value: result });
                });
            }));
            promises.push(new Promise(resolve => {
                query("SELECT medal.*, employee_medal.id FROM employee_medal INNER JOIN medal ON `employee_medal`.`medal_id` = `medal`.`medal_id` WHERE employee_id = ?", context.req.query?.id).then(result => {
                    resolve({ key: "medals", value: result });
                });
            }));
            Promise.all(promises).then(result => {
                resolve(streamsToProps(result));
            });
        });
    },
    getKey: (context) => { return `employeeDetails-${context.req.query?.id}`; },
    canCollect: () => { return true; }
}

export default stream;