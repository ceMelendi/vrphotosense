const dynamodb = require("cyclic-dynamodb");
const router = require("router");

// Initialize AWS DynamoDB
const db = DynamoDb(process.env.CYCLIC_DB);
const logsCollection = db.collection("logs");

// ------------------------------------
// GET ROUTES
// ------------------------------------

// Get all logs
router.get("/logs", async (req, res) => {
    const { results: logsMetadata } = await logsCollection.list();
  
    const logs = await Promise.all(
        logsMetadata.map(async ({ key }) => (await logsCollection.get(key)).props)
    );
  
    res.render('logs.twig', {files: names});
  });

router.get('/:date', async (req, res) => {
    var date = req.params.date;

    try {
        const { props: log } = await logsCollection.get(date);
        res.send(bike);
    } catch (err) {
        console.log(err.message, `Log with date ${date} does not exist`);
        res.sendStatus(404);
    }

    //res.sendFile(__dirname + '/Logs/' + date + '.log');
});
  
