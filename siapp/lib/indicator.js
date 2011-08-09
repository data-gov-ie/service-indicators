	var locationName;
	var locationURI;
	
	var indicatorYear = "<http://reference.data.gov.uk/id/year/2009>";
	
	var properties = [];
	
	var indicators = [];
	var topIndicators = [];
	var bottomIndicators = [];
	
	var positions = [];
	
	$(document).ready(function() {
	  //  google.load('visualization', '1',
        //{'packages': ['table', 'map', 'corechart']});
		  
		var uri = getUrlVars()["uri"];
		var name = getUrlVars()["name"];
		locationURI = uri;
		name = decodeURIComponent(name);
		locationName = name;
		
		//loadThirdPartyData(uri,name);
		
		loadProperties(locationURI,locationName,positions);
		
		//loadDataSets(uri, name);
		
		$("#location-title-holder").html(locationName);
		$("#location-main-holder").html("<a href=\""+locationURI+"\" target=\"_blank\">" + locationName + "</a>");
	});
	
	function getUrlVars() {
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for (var i = 0; i < hashes.length; i++)
		{
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	}
	
	/*
	
	function buildDBPediaQuery (name) {
		index = name.indexOf("City");
		var sparql;
		if (index==-1) {//it is a county
		    index = name.indexOf("County");
			var county = name.substring(index+7); 
			sparql = " SELECT distinct ?loc ?web ?img ?map " + //+?area " +
					 " WHERE { " +
					 " ?loc a <http://dbpedia.org/ontology/Settlement> . " +
					 " ?loc <http://purl.org/dc/terms/subject> <http://dbpedia.org/resource/Category:Counties_of_the_Republic_of_Ireland> . " +
					 " ?loc <http://dbpedia.org/property/web> ?web . " +
					 " ?loc <http://dbpedia.org/ontology/thumbnail> ?img . " +
					 " ?loc <http://dbpedia.org/property/mapImage> ?map . " +
					 " ?loc <http://www.w3.org/2000/01/rdf-schema#label> ?label . " +
					 //" ?loc <http://dbpedia.org/property/areaKm> ?area . " +
					 " FILTER(REGEX(?label, \"" + county + "\" )) . " +
					 " } ";
		}
		else  {// it is a city
			var city = name.substring(0,index); 
			sparql = " SELECT distinct ?loc ?web ?img " +
					 " WHERE { " +
					 " ?loc a <http://dbpedia.org/ontology/Place> . " +
					 " ?loc <http://purl.org/dc/terms/subject> <http://dbpedia.org/resource/Category:Cities_in_the_Republic_of_Ireland> . " +
					 " ?loc <http://dbpedia.org/property/website> ?web . " +
					 " ?loc <http://dbpedia.org/ontology/thumbnail> ?img . " +
					 " ?loc <http://www.w3.org/2000/01/rdf-schema#label> ?label . " +
					 " FILTER(REGEX(?label, \"" + city + "\" )) . " +
					 " } " ;
		}
		return sparql;
	}
	
	function loadDBpediaData(uri,name) {
		var sparql = buildDBPediaQuery(name);
		console.log(sparql);
		_URIbase = "http://dbpedia.org/sparql?query=";
		var queryURLBase = _URIbase + escape(sparql) + "&format=json";
		var region = new Object;
		$.getJSON(queryURLBase, function(data, textStatus){
		if(data.results) {
			var rows = data.results.bindings;
			var regions = [];
			for(i in rows) {
				var row = rows[i];
				region.name = row.loc.value;
				region.web = row.web.value;
				if (region.web.indexOf("http")==-1)
					region.web ="http://"+region.web;
				region.img = row.img.value;
				//region.area = row.area.value;
				regions[i] = region; 
			}
			displayDBpediaData(region);
			}
		});
	}
	*/
	function displayDBpediaData(region) {
		/*var area = region.area;
		if (area=='undefined') {
			area = '<br>Area in km. ' + area;
		}*/
		$("#dbpedia-content-holder").html("<a href=\""+region.name+"\" target='_blank'>" + locationName + "</a><br>" + "<img src=\"" + region.img + "\"><br><a href=\""+region.web+"\" target=\"_blank\">" + region.web +"</a>"); //  + area );
	}
	
	// In the end we have to choose a particular observation that has the population of the country
	// so, we will use, by the moment, the one has city|county/total 
	/*
	function buildCensusQuery (uri,name) {
		index = name.indexOf("County");
		name = name.substring(index+7); 
	    name = name.toLowerCase();
		var sparql = " PREFIX qb: <http://purl.org/linked-data/cube#> " +
					 " PREFIX property: <http://stats.data-gov.ie/property/>  " +
					 " SELECT ?o ?pop " +
					 " WHERE { " +
					 " ?o a qb:Observation . " + 
					 " ?o property:geoArea <" + uri + "> . " +
					 " ?o property:population ?pop . " +
					 " FILTER(REGEX(STR(?o),\"" + name +"/total\")) . " +
					 " } LIMIT 10";
		return sparql;
	}	

	function loadCensusData(uri,name) {
		var sparql = buildCensusQuery(uri,name);
		_URIbase = "http://data-gov.ie/sparql?query=";
		console.log(sparql);
		var queryURLBase = _URIbase + escape(sparql) + "&format=json";
		var region = new Object;
		$.getJSON(queryURLBase, function(data, textStatus){
		if(data.results) {
			var rows = data.results.bindings;
			var regions = [];
			for(i in rows) {
				var row = rows[i];
				region.population = row.pop.value;
				regions[i] = region; 
			}
			
			displayCensusData(region);
			
			}
		});
	}

	function displayCensusData(region) {
		$("#census-content-holder").html("Population " + region.population );
	}
	
	function loadThirdPartyData(uri, name) {
		loadDBpediaData(uri, name);
		//loadCensusData(uri,name);
	}
	*/
	
	/*
	function loadDataSets(resourceUri,resourceName) {
		_URIbase = "http://localhost:8890/sparql?query=";
		_offsetActual = 0;
		_resourceUriActual = resourceUri;
		// Clear the previous results if any.
		$("#content-holder").html("");
		$("#rel1").html("");
		$("#rel2").html("");

		// Display the resource name being queried.
		
		$("#name-block").html("<div id='name-header'><div style='margin-left: 20px;'><a  target='_blank' href='"+resourceUri+"'>"+resourceName+"</a></div></div>");
		
		// Generate the SPARQL request for retrieving the properties of 
		// the specified location, i.e., indicators.  
			
		var sparql = " PREFIX data: <http://stats.data-gov.ie/data/>  " +
					 " PREFIX qb: <http://purl.org/linked-data/cube#>  " +
					 " SELECT ?ds " +
					 " WHERE { " +
					 " ?ds a qb:DataSet " +
					 "} ORDER BY ?ds ";
		
		
		// baseURI for executing the sparql query. 
		var Url = _URIbase + escape(sparql) + "&format=json";
		//alert(sparql);
		// An ajax request that requests the above URI and parses the response. 
		$.ajax( {
			dataType :'jsonp',
			jsonp :'callback',
			url : Url,
			success : function(json) {
		
				// If we found a related scv:item we display it
				if( json && 
					json.results && 
					json.results.bindings && 
					json.results.bindings.length > 0) {
					var bindings = json.results.bindings;
					var datasets = [];
					
					for (var i=0; i<bindings.length; i++) {
						var row = bindings[i];
						var dataset = new Object;
						dataset.uri = row.ds.value;
						datasets[i] = dataset;
					}

					// render the manifestation table
					$('#content-holder').html("");
										
					displayDataSets(datasets);
					

				} 

				// If we did not find any scv:item for the specified 
				// resource, display an error message.  
				else {
					$('#name_loading').html("");
					var html = "<div id='missing'>No datasets were found <\/div>";
					$("#content-holder").html(html);
				}
			}
		});
	}
	*/
	
	function loadProperties() {
		_URIbase = "http://localhost:8890/sparql?query=";
		
		// Generate the SPARQL request for retrieving the properties of 
		// the specified location, i.e., indicators.  
			
		var sparql = " PREFIX qb: <http://purl.org/linked-data/cube#>  " +
					 " SELECT ?uri ?label" +
					 " WHERE { " +
					 " ?uri a qb:MeasureProperty ." +
					 " ?uri <http://www.w3.org/2000/01/rdf-schema#label> ?label ." +
					 "} ORDER BY ?uri ";
					 
		
		
		// baseURI for executing the sparql query. 
		var Url = _URIbase + escape(sparql) + "&format=json";

		// An ajax request that requests the above URI and parses the response. 
		$.ajax( {
			dataType :'jsonp',
			jsonp :'callback',
			url : Url,
			success : function(json) {
		
				// If we found a related scv:item we display it
				if( json && 
					json.results && 
					json.results.bindings && 
					json.results.bindings.length > 0) {
					var bindings = json.results.bindings;
										
					for (var i=0; i<bindings.length; i++) {
						var row = bindings[i];
						var property = new Object;
						property.uri = row.uri.value;
						property.label = row.label.value;
						properties[i] = property;
						
					}
				
					for (var i=0;i<properties.length; i++) {
						calculatePosition(properties[i].uri,properties[i].label,locationURI,i);
					}

					
					
					
				} 

						
				// If we did not find any property
				// resource, display an error message.  
				else {
					$('#name_loading').html("");
					var html = "<div id='missing'>No datasets were found <\/div>";
					$("#content-holder").html(html);
				}
			}
		});
		
		

	}	
	
	function calculatePosition(propURI,propLabel,locationURI,propertyIndex) {
		_URIbase = "http://localhost:8890/sparql?query=";
		position = 0;
		
		// Generate the SPARQL request for calculating the values per property
		var sparql = " PREFIX data: <http://stats.data-gov.ie/data/>" +
					 " PREFIX qb: <http://purl.org/linked-data/cube#> " +
					 " PREFIX dimension: <http://purl.org/linked-data/sdmx/2009/dimension#> " +
					 " PREFIX property: <http://stats.data-gov.ie/property/> " +
					 " PREFIX skos: <http://www.w3.org/2004/02/skos/core#> " +
					 " SELECT ?val ?geo ?label " + 
					 " WHERE { " + 
					 " ?obs a qb:Observation . " +
					 " ?obs dimension:refPeriod " +  indicatorYear + " ." +
					 " ?obs property:geoArea ?geo . " +
					 " OPTIONAL { ?geo skos:prefLabel ?label . } . " + 
					 " ?obs qb:dataSet ?ds . " +
					 " ?obs <" + propURI + "> ?val . " +
					 " } ORDER BY desc(?val)";
		
		
		
		// baseURI for executing the sparql query. 
		var Url = _URIbase + escape(sparql) + "&format=json";

		// An ajax request that requests the above URI and parses the response. 
		$.ajax( {
			dataType :'jsonp',
			jsonp :'callback',
			url : Url,
			success : function(json) {
		
				// If we found a related scv:item we display it
				if( json && 
					json.results && 
					json.results.bindings && 
					json.results.bindings.length > 0) {
					var bindings = json.results.bindings;
					var props = []
					var len = 0;
					for (var i=0; i<bindings.length; i++) {
						var row = bindings[i];
						if (row.val) {
							var property = new Object();
							property.val = row.val.value;
							property.locURI = row.geo.value;
							//property.locLabel = row.label.value;
							property.label = propLabel;
							if (property.locURI == locationURI) {
								position = i+1;
								value = property.val;
							}
							props[len++] = property;
						}
					}
					if (position != 0) {
						//console.log('property ' + propURI + '\tvalue ' + value + '\tposition ' + position );
						positions[propURI]=position;
						indicators[propURI] = props;
						console.log(' -- ' + positions[propURI]);
					}
					
					if (propertyIndex == properties.length -1) {
						selectPropertiesToDisplay();
					}
					
					
				} 
			}
		});
	}
	
	function selectPropertiesToDisplay() {
		var currenttop = 0;
		var currentbottom = 33;
		
		var bottomProperty;
		var topProperty;
		
		//Select the top property and the bottom one
		for (m in positions) {
			console.log(m + ' ' + positions[m])
		    if (positions[m] > currenttop) {
				currenttop = positions[m];
				bottomProperty = m;
			}
			if (positions[m] <= currentbottom) {
				currentbottom = positions[m];
				topProperty = m;
			}
		}
		
		displayChartTop1Property(topProperty);
		displayChartBottom1Property(bottomProperty);
		
	}
	
	
	function displayChartTop1Property(topProperty) {
		var props = indicators[topProperty];
		console.log(topProperty);

		var data = new google.visualization.DataTable();
        data.addColumn('string', 'Location');
        data.addColumn('number', /*topProperty*/props[0].label);
		data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			//data.setValue(i, 0, props[i].locLabel);
			data.setValue(i, 0, props[i].locURI);
			data.setValue(i, 1, parseFloat(props[i].val));			

			}

		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_top_1'));
		barsVisualization.draw(data, {width: 600, height: 300, title: props[0].label, legend:'none' });
	
	}
	
	
	function displayChartBottom1Property(bottomProperty) {
		var props = indicators[bottomProperty];
		console.log(bottomProperty);

		var data = new google.visualization.DataTable();
        data.addColumn('string', 'Location');
        data.addColumn('number', /*bottomProperty*/props[0].label);
        data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			//data.setValue(i, 0, props[i].locLabel);
			data.setValue(i, 0, props[i].locURI);
			data.setValue(i, 1, parseFloat(props[i].val));			

			}

		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_bottom_1'));
		barsVisualization.draw(data, {
			width: 600, 
			height: 300, 
			title: props[0].label, 
			legend:'none',
			gridlineColor: '#fff',
			hAxis: {
               textPosition: 'none'
			},
			vAxis: {
               textPosition: 'none',
               baselineColor: '#ccc'
			}
			});
		
			/*
		chart.draw(data, {
          width: 400,
          height: 240,
          legend: 'none',
          gridlineColor: '#fff',
          hAxis: {
               textPosition: 'none'
          },
          vAxis: {
               textPosition: 'none',
               baselineColor: '#ccc'
          }
     });*/
	
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	

	
	
