const dynamodb = require("cyclic-dynamodb");
const router = require("router");

// Initialize AWS DynamoDB
const CyclicDb = require("@cyclic.sh/dynamodb");
const db = CyclicDb("excited-shorts-toadCyclicDB");
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

    let fileList = logs.filter(file => file.endsWith('.log'));
    let names = fileList.map(file => file.substring(0, file.length - 4));
  
    res.render('logs.twig', {files: names});
  });

router.get('/:date', async (req, res) => {
    var date = req.params.date;

    try {
        const { props: log } = await logsCollection.get(date);
        res.send(log);
    } catch (err) {
        console.log(err.message, `Log with date ${date} does not exist`);
        res.sendStatus(404);
    }

    //res.sendFile(__dirname + '/Logs/' + date + '.log');
});
  
