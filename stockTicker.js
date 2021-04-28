var http = require('http'); //require needed modules
var fs = require('fs');
var qs = require('querystring');
const mongo = require('mongodb').MongoClient;
const url = "mongodb+srv://malloryhood:malloryhood@cluster0.sb42v.mongodb.net/companies?retryWrites=true&w=majority"
	
http.createServer(function (req, res)  //create server
{
    if (req.url == "/") //if main page
	{
        file = 'formInput.html'; //show main form 
  		fs.readFile(file, function(err, txt) 
        {
      	    res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(txt);
            res.end();
  	    });
	}
    
    else if (req.url == "/process") //if data processing
	{
		res.writeHead(200, {'Content-Type':'text/html'});
        mongo.connect(url, function(err, db) //connect to database
        {
            var dbo = db.db("companies"); //specify what data will be accessed
        	var coll = dbo.collection('companies');
            pdata = "";
            theQuery="";
            //get data from post
   		    req.on('data', data => {
                pdata += data.toString();
            });
   		    // process data once done
   		    req.on('end', () => {
   			    pdata = qs.parse(pdata);
                if (pdata['ticker']) //if ticker entered
                {
                    theQuery = {Ticker:pdata['ticker']};
                }
                else if (pdata['company']) //if company entered
                {
                    theQuery = {Company:pdata['company']};
                }
                if (theQuery=="") //only called if user manually enters URL for processing, otherwise lack of entry would be caught by form validation.
                {
                    res.write("Something went wrong! Please try entering your search again.")
                }
                else
                {
                    coll.find(theQuery).toArray(function(err, items) //search for matches in database
                    {
                        res.write("<h2>Search Results</h2><br>");
                        if(items.length == 0) //if no match
                        {
                            res.write("We don't have data for your search, please try entering different search parameters.");
                        }
        	            else 
        	            {
                            for (i=0; i<items.length; i++)
                            {
                                res.write("<b>Company Name:</b> " + items[i].Company  + "<br><b>Ticker:</b> " + items[i].Ticker + "<br><br>");		
        	                }
                        }   
        	            db.close();
                        res.end();
                    });
                }
            });
        });
    }
    
    else //if a URL was manually entered by user
  	{
  		res.writeHead(200, {'Content-Type':'text/html'});
  		res.write ("Unknown page request");
        res.end();
  	} 
}).listen(8080); //close server