import { query } from "../../lib/db";
import { Stream } from "../streams";

const stream: Stream = {
    ttl: 60,
    fallback: [],
    getData: async (context) => {
        const page = context.req.query?.page ?? 1;
        if (context.req.query?.search) {
            if (context.req.query.search.length < 3) {
                return null;
            }
            return query("SELECT * FROM employee WHERE name LIKE ? LIMIT ?, 50", "%" + context.req.query.search + "%", (page - 1) * 50)
        }
        if (context.req.query?.qualification) {
            return query("SELECT DISTINCT employee.* FROM employee INNER JOIN employee_qualification ON employee_id = receiver_id WHERE qualification_id = ? LIMIT ?, 50", context.req.query.qualification, (page - 1) * 50)
        }
        return query("SELECT * FROM employee LIMIT ?, 50", (page - 1) * 50);
    },
    getKey: (context) => { return `employees-${context.req.query?.search}-${context.req.query?.qualification}-${context.req.query?.page}`; },
    canCollect: () => { return true; }
}

export default stream;