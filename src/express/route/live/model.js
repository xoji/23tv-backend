const { fetch, fetchAll } = require('../../../lib/postgres')


const STATUS = `
SELECT 
*
FROM live_status
`

const UPDATE_STATUS = `
UPDATE live_status
SET live_status_status = $1,
	livetitle = $2,
	livebody = $3
WHERE live_status_id = '28b96835-41e7-48d9-8544-50b2417c5224' RETURNING *
`
// '3c33ea3e-bb23-404a-8102-19f4b86768c3' -> offline
// '28b96835-41e7-48d9-8544-50b2417c5224' -> online

const Status = () => fetch(STATUS)

const UpdateStatus = ({ status, liveTitle, liveBody }) => fetch(UPDATE_STATUS, status, liveTitle, liveBody)

module.exports = {
	Status,
	UpdateStatus
}