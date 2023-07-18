//////////////////////////////////////////////////////////////INITIALIZATION SECTION/////////////////////////////////////////////////////

let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
const port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

const {Client} = require("pg");
const client = new Client({
  user: "postgres",
  password: "&@(#!n@nikhare",
  port: 5432,
  host: "db.jyrbjpmkudbexvqqrmpu.supabase.co",
  ssl: {rejectUnauthorized: false},
});
client.connect(function(res,error){
  console.log("Connected!!!");
});


/////////////////////////////////////////////////////////////GET SECTION//////////////////////////////////////////////////////////////////
app.get("/shops",function(req,res,next){
  const query = 'SELECT shopid, name FROM shops'
  client.query(query,function(err,result){
      if(err){
          console.log(err);
          return res.status(440).send(err);
      }
      return res.send(result.rows);
      client.end();
  });
});

app.get("/products",function(req,res,next){
  const query = "SELECT * FROM products";
  client.query(query,function(err,result){
    if(err) return res.status(440).send(err);
    return res.send(result.rows);
  })
})

app.get("/purchases/:filterby/:id",function(req,res,next){
  const filterby = req.params.filterby;
  const id = +req.params.id;
  let query;
  if(filterby=="shops"){
    query = 'SELECT shopid, productid, quantity, price FROM purchases WHERE shopid=$1';
  }
  else{
    query = 'SELECT shopid, productid, quantity, price FROM purchases WHERE productid=$1';
  }
  client.query(query,[id],function(err,result){
    if(err) return res.status(440).send(err)
    return res.send(result.rows);
    client.end();
  });
});

app.get("/totalPurchase/:filterby/:id",function(req,res,next){
  const filterby = req.params.filterby;
  const id = +req.params.id;
  let query;
  if(filterby=="shop"){
    query = "SELECT productid, SUM(quantity) AS quantity FROM purchases WHERE shopid = $1 GROUP BY productid";
  }
  else{
    query = "SELECT shopid, SUM(quantity) AS quantity FROM purchases WHERE productid = $1 GROUP BY shopid";
  }
  client.query(query,[id],function(err,result){
    if(err) return res.status(440).send(err);
    return res.send(result.rows);
    client.end();
  });
});

app.get("/purchases",function(req,res,next){
  const {shop = "", product = [], sort = ""} = req.query;
  let query = "SELECT shopid, productid, quantity, price FROM purchases";
  let condition = [];
  let orderby;
  if(shop){
    condition.push(`shopid= ${shop}`)
  }
  if(product.length>0){
    condition.push(`productid IN (${product})`);
  }
  if(sort=="QtyAsc"){
    orderby = "ORDER BY quantity ASC";
  }
  if(sort=="QtyDesc"){
    orderby = "ORDER BY quantity DESC";
  }
  if(sort=="ValueAsc"){
    orderby = "ORDER BY (quantity * price) ASC";
  }
  if(sort=="ValueDesc"){
    orderby = "ORDER BY (quantity * price) DESC";
  }
  if(condition.length>0){
    query += ' WHERE '+ condition.join(" AND ")
  }
  if(sort!=""){
    query += orderby;
  }
  client.query(query,function(err, result) {
    if (err) return res.status(440).send(err);
    return res.send(result.rows);
  });
})

/////////////////////////////////////////////////////////////POST SECTION////////////////////////////////////////////////////////////////////

app.post("/shops",function(req,res,next){
  let body = Object.values(req.body);
  let query = "INSERT INTO shops (name, rent) VALUES ($1,$2)";
  client.query(query,body,function(err,result){
    if(err) return res.status(440).send(err);
    return res.send(req.body);
  });
});

app.post("/products",function(req,res,next){
  let body = Object.values(req.body);
  let query = "INSERT INTO products (productname, category, description) VALUES ($1,$2,$3)";
  client.query(query,body,function(err,result){
    if(err) return res.status(440).send(err);
    return res.send(req.body);
  });
});

app.post("/purchases",function(req,res,next){
  let body = Object.values(req.body);
  let query = "INSERT INTO purchases (shopid, productid, quantity, price) VALUES ($1, $2, $3, $4)";
  client.query(query,body,function(err,result){
    if(err) return res.status(440).send(err);
    return res.send(req.body);
  });
});



/////////////////////////////////////////////////////////PUT SECTION//////////////////////////////////////////////////////////////////////////

app.put("/products/:id", function(req, res, next) {
  let body = Object.values(req.body);
  let id = +req.params.id;
  let query = "UPDATE products SET productname=$1, category=$2, description=$3 WHERE productid=$4";
  body.push(id);
  client.query(query, body, function(err, result) {
    if (err) return res.status(440).send(err);
    return res.send(req.body);
  });
});
