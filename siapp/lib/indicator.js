	var locationName;
	var locationURI;
	
	var indicatorYearURI = "<http://reference.data.gov.uk/id/year/2009>";
	var indicatorYear = "2009";
	
	var properties = [];
	
	var indicators = [];
	var positions = [];
	
	
	$(document).ready(function() {
		document.getElementById('result-container').style.display='none';

		var uri = getUrlVars()["uri"];
		var name = getUrlVars()["name"];
		locationURI = uri;
		name = decodeURIComponent(name);
		locationName = name;
		
		$("#location-title-holder").html(locationName);
		$("#location-main-holder").html("<a href=\""+locationURI+"\" target=\"_blank\">" + locationName + "</a> " + "- " +indicatorYear);
		
		loadProperties(locationURI,locationName,positions);

		//setupAutoComplete();
		/*var uri = getUrlVars()["uri"];
		var name = getUrlVars()["name"];
		locationURI = uri;
		name = decodeURIComponent(name);
		locationName = name;
		
		loadProperties(locationURI,locationName,positions);	
		
		loadThirdPartyData(uri,name);
		
		$("#location-title-holder").html(locationName);
		$("#location-main-holder").html("<a href=\""+locationURI+"\" target=\"_blank\">" + locationName + "</a> " + "- " +indicatorYear);*/

		
	});
	
	/** General purpose functions **/
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
	
	function switchLayers() {
	/*	document.getElementById('result-container').style.display='none';
		document.getElementById('homesearch').style.display='block';

		$("#homesearch #name").val('');
		$('#homesearch #name').css('color', '#000');
		$("#homesearch #name").click(function() {
		if (true) {
			$("#homesearch #name").val('');
			$('#homesearch #name').css('color', '#000');
		}
		});
		$("#homesearch #name").focus();
		
		$("#content-holder").html("");
		var html = "<table class=\"externalInfo\"><tr><td class=\"externalInfo\"><br><div id=\"dbpedia-content-holder\"><\/div><br><div id=\"census-content-holder\"><\/div><\/td><\/tr><\/table>" +
				   "<table class=\"chart\"><tr><td><div id=\"chart_div_top_1\"><\/div><\/td><td><div id=\"chart_div_top_2\"><\/div><\/td><\/tr>" +
				   "<tr><td><div id=\"chart_div_bottom_1\"><\/div><\/td><td><div id=\"chart_div_bottom_2\"><\/div><\/td><\/tr><\/table>";
		$("#tables").html(html);*/
	}
	
	/** Functions related to the DBpedia **/
	/** Function to build a query for a given City/County **/
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
	
	/** Function to load data from DBpedia for a given City/County (uri and name) **/
	function loadDBpediaData(uri,name) {
		var sparql = buildDBPediaQuery(name);
		
		//console.log(sparql);
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
	
	/** Function to display dbpedia data for a given city/county - region is an internal object **/
	function displayDBpediaData(region) {
		
		$("#location-title-holder").html(locationName);
		$("#location-main-holder").html("Service indicators for <a href=\""+locationURI+"\" target=\"_blank\">" + locationName + "</a> " + "- " +indicatorYear );
			
		//$("#location-main-holder").html();
		
		var threshold   = 800,
		successFunc = function(){ 
			$("#dbpedia-content-holder").html("<a href=\""+region.name+"\" target='_blank'>" + locationName + " in DBpedia </a><br>" + "<img src=\"" + region.img + "\"><br><a href=\""+region.web+"\" target=\"_blank\">" + region.web +"</a>"); //  + area );
		};
		var myXHR = $.ajax({
		  url: $("<a href=\""+ region.img + "\"").attr('href'),
		  type: 'text',
		  method: 'get',
		  error: function() {
			$("#dbpedia-content-holder").html("<a href=\""+region.name+"\" target='_blank'>" + locationName + " in DBpedia </a><br>" + "<a href=\""+region.web+"\" target=\"_blank\">" + region.web +"</a>"); //  + area );
		  },
		  success: successFunc
		});

		setTimeout(function(){
		myXHR.abort();
		successFunc();
		}, threshold);

	}
	
	/** Functions related to the Census **/
	/** In the end we have to choose a particular observation that has the population of the country **/
	/** so, we will use, by the moment, the one has city|county/total **/
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

	/** Function to load data from census for a given City/County (uri and name) **/	
	function loadCensusData(uri,name) {
		var sparql = buildCensusQuery(uri,name);
		_URIbase = "http://data-gov.ie/sparql?query=";
		//console.log(sparql);
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

	/** Function to display data from census for a given City/County **/	
	function displayCensusData(region) {
		$("#census-content-holder").html("Population " + region.population );
	}
	
	/** Function to load data from external resources **/
	function loadThirdPartyData(uri, name) {
		loadDBpediaData(uri, name);
		//loadCensusData(uri,name);
	}
	
	
	/** Functions related to the service indicators **/
	
	/** Function to load properties **/
	function loadProperties(locationURI,locationName,positions) {
		$("#loading_container").html("<div style='margin:auto; width:300px;'> <center> <b>Loading</b><br><br> <img style='padding-left:7px; vertical-align:center; width: 40px;' src='img/ajax-loader-search.gif'/> </center>");
	
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
					var html = "<div id='missing'>No indicators were found. <\/div>";
					$("#content-holder").html(html);
				}
			}
		});
	}	

	/** Function to calculate the position of a given city in an indicatory 
		propURI - property URI
		propLabel - property label
		locationURI - URI of the city/county
		propertyIndex - index of the current property
	**/	
	function calculatePosition(propURI,propLabel,locationURI,propertyIndex) {
		_URIbase = "http://localhost:8890/sparql?query=";
		position = 0;
		
		// Generate the SPARQL request for calculating the values per property
		var sparql = " PREFIX data: <http://stats.data-gov.ie/data/>" +
					 " PREFIX qb: <http://purl.org/linked-data/cube#> " +
					 " PREFIX dimension: <http://purl.org/linked-data/sdmx/2009/dimension#> " +
					 " PREFIX property: <http://stats.data-gov.ie/property/> " +
					 " PREFIX skos: <http://www.w3.org/2004/02/skos/core#> " +
					 " SELECT distinct ?val ?geo ?label " + 
					 " WHERE { " + 
					 " ?obs a qb:Observation . " +
					 " ?obs dimension:refPeriod " +  indicatorYearURI + " ." +
					 " ?obs property:geoArea ?geo . " +
					 " ?geo skos:prefLabel ?label . " + 
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
							property.locLabel = row.label.value;
							var index = property.locLabel.indexOf("(administrative)");
							if (index != -1)
								property.locLabel = property.locLabel.substring(0,index);
							property.label = propLabel;
							
							if (property.locURI == locationURI) {
								position = i+1;
								value = property.val;
							}
							props[len++] = property;
						}
					}
					
					//indicators[propURI] = props;
					
					if (position != 0) {
						//console.log('property ' + propURI + '\tvalue ' + value + '\tposition ' + position );
						var size = positions.length;
						var pos = new Object();
						pos.position = position;
						pos.propURI = propURI;
						pos.propLabel = propLabel;
						positions[size] = pos;
						//positions[propURI]=position;
						indicators[propURI] = props;
					} 
					
					if (propertyIndex == properties.length -1) {
						selectPropertiesToDisplay();
					}
				} 
			}
		});
	}

	
	/** Function to select the properties to display, two top properties, and two bottom properties **/	
	function selectPropertiesToDisplay() {
		//order the array
		positions.sort( function (a,b) 
			{ 
				return b.position - a.position;
			} );
			
			
			
		displayChartTopProperty1(positions[positions.length-1].propURI,positions[positions.length-1].position,1);
		displayChartTopProperty2(positions[positions.length-2].propURI,positions[positions.length-2].position,2);
		//displayChartTopProperty(positions[positions.length-3].propURI,positions[positions.length-3].position,3);
		displayChartBottomProperty1(positions[1].propURI,positions[1].position,1);
		displayChartBottomProperty2(positions[0].propURI,positions[0].position,2);		
		
		document.getElementById('result-container').style.display='block';
		$('#loading_container').html("");
	}
	
	/** Function to display a chart of a top property 
		topProperty - the property to display
		position - the position of the county/city for that property
		index - if it is the 1 or 2 property
	**/		
	function displayChartTopProperty1(topProperty, position, index) {
		var props = indicators[topProperty];
		//console.log(topProperty);

		var data = new google.visualization.DataTable();
        data.addColumn('string', 'Location');
        data.addColumn('number', /*topProperty*/props[0].label);
		data.addColumn('number', 'foo');
		data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			data.setValue(i, 0, props[i].locLabel);
			//data.setValue(i, 0, props[i].locURI);
			if (props[i].locURI == locationURI) {
				data.setValue(i, 1, 0);
				data.setValue(i, 2, parseFloat(props[i].val));			
			}
			else {
				data.setValue(i, 1, parseFloat(props[i].val));
				data.setValue(i, 2, 0);			
			}
		}

		$('#first-position').html("<p class='position'> # " + position +"&nbsp;&nbsp;</p>");
		$('#first-position-description').html("<p class='position-description'>" + props[0].label +"</p>");		
		
		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_top_'+index));
		barsVisualization.draw(data, {width: 900, height: 500, colors:['#345AE3','#072699'], legend:'none', isStacked:'true', backgroundColor: '#F7F7F7',  vAxis: {title:'hola', titleTextStyle:'', color: '#FF0000' } });
	
	}

	/** Function to display a chart of a top property 
		topProperty - the property to display
		position - the position of the county/city for that property
		index - if it is the 1 or 2 property
	**/		
	function displayChartTopProperty2(topProperty, position, index) {
		var props = indicators[topProperty];
		//console.log(topProperty);

		var data = new google.visualization.DataTable();
        data.addColumn('string', 'Location');
        data.addColumn('number', /*topProperty*/props[0].label);
		data.addColumn('number', 'foo');		
		data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			data.setValue(i, 0, props[i].locLabel);
			//data.setValue(i, 0, props[i].locURI);
			if (props[i].locURI == locationURI) {
				data.setValue(i, 1, 0);
				data.setValue(i, 2, parseFloat(props[i].val));			
			}
			else {
				data.setValue(i, 1, parseFloat(props[i].val));
				data.setValue(i, 2, 0);			
			}			
		}

		$('#second-position').html("<p class='position'> # " + position +"&nbsp;&nbsp;</p>");
		$('#second-position-description').html("<p class='position-description'>" + props[0].label +"</p>");		
			
		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_top_'+index));
		barsVisualization.draw(data, {width: 900, height: 500, colors:['#345AE3','#072699'], legend:'none', isStacked:'true', backgroundColor: '#F7F7F7',   vAxis: {title:'hola', titleTextStyle:'', color: '#FF0000' } } );
	
	}
	
	/** Function to display a chart of a top property 
		topProperty - the property to display
		position - the position of the county/city for that property
		index - if it is the 1 or 2 property
	**/		
	function displayChartBottomProperty1(bottomProperty,position,index) {
		var props = indicators[bottomProperty];
		//console.log(bottomProperty);

		var data = new google.visualization.DataTable();
        data.addColumn('string', 'Location');
        data.addColumn('number', props[0].label);
		data.addColumn('number', 'foo');
        data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			data.setValue(i, 0, props[i].locLabel);
			//data.setValue(i, 0, props[i].locURI);
			if (props[i].locURI == locationURI) {
				data.setValue(i, 1, 0);
				data.setValue(i, 2, parseFloat(props[i].val));			
			}
			else {
				data.setValue(i, 1, parseFloat(props[i].val));
				data.setValue(i, 2, 0);			
			}			
		}

		$('#first-last-position').html("<p class='position'> # " + position +"&nbsp;&nbsp;</p>");
		$('#first-last-position-description').html("<p class='position-description'>" + props[0].label +"</p>");		

			
		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_bottom_'+index));
		barsVisualization.draw(data, {
			width: 900, 
			height: 500,
			colors:['#C82442','#8B071F'],
			isStacked:'true',
			//is3D: true,
			//colors:[{color:'#FF0000', darker:'#680000'}],
			legend:'none',
			backgroundColor: '#F7F7F7',
			vAxis: {title:'hola', titleTextStyle:'', color: '#FF0000' }
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
	
	
	
	/** Function to display a chart of a top property 
		topProperty - the property to display
		position - the position of the county/city for that property
		index - if it is the 1 or 2 property
	**/		
	function displayChartBottomProperty2(bottomProperty,position,index) {
		var props = indicators[bottomProperty];
		//console.log(bottomProperty);

		var data = new google.visualization.DataTable();
        data.addColumn('string', 'Location');
        data.addColumn('number', props[0].label);
		data.addColumn('number', 'foo');
        data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			data.setValue(i, 0, props[i].locLabel);
			//data.setValue(i, 0, props[i].locURI);
			data.setValue(i, 1, parseFloat(props[i].val));			
			}

		$('#second-last-position').html("<p class='position'> # " + position +"&nbsp;&nbsp;</p>");
		$('#second-last-position-description').html("<p class='position-description'>" + props[0].label +"</p>");		

		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_bottom_'+index));
		barsVisualization.draw(data, {
			width: 900, 
			height: 500,
			colors:['#C82442','#8B071F'],
			isStacked:'true',
			//is3D: true,
			//colors:[{color:'#FF0000', darker:'#680000'}],
			legend:'none',
			backgroundColor: '#F7F7F7',
			vAxis: {title:'hola', titleTextStyle:'', color: '#FF0000' }
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
	
	
	
	
	
	
	
	
	
	
	
	

	
	
