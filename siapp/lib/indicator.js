	var locationName;
	var locationURI;
	
	var indicatorYearURI = "<http://reference.data.gov.uk/id/year/2009>";
	var indicatorYear = "2009";
	
	var properties = [];
	
	var indicators = [];
	var positions = [];
	
	_resourceType_City = "http://geo.data-gov.ie/City";
	_resourceType_County = "http://geo.data-gov.ie/AdministrativeCounty";
	_nameProperty = "http://www.w3.org/2004/02/skos/core#prefLabel";
	
	$(document).ready(function() {
		document.getElementById('result-container').style.display='none';

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
	
	
	/** Functions for the autocomplete **/
	/**
	 * This code loads the resources 
	 * of type _resourceType, that will be the core of the page, and loads their names 
	 * into an autocomplete field.  
	 */
	function setupAutoComplete() {
		 //$("#progressbar").progressbar({ value: 0});
			
		_autoCompleteMap = [];
		_autoCompleteArray = [];

		// SPARQL query for getting the count of the number of locations
		
		var sparql =
			"SELECT COUNT(?uri) AS ?count WHERE { " +
				//"?uri a <" + _resourceType + "> . " +
				" { ?uri a <" + _resourceType_County + "> } UNION { ?uri a <" + _resourceType_City + "> } . " +
			"?uri <" + _nameProperty + "> ?name . " +
			"}";
		_URIbase = "http://localhost:8890/sparql?query=";
		// URI for executing the sparql query. 
		var locationUrl = _URIbase + escape(sparql) + "&format=json";
		
		// An ajax request that requests the above URI and parses the response. 
		$.ajax( {
			dataType :'jsonp',
			jsonp :'callback',
			url : locationUrl,
			success : function(json) {
				if( json && 
					json.results && 
					json.results.bindings && 
					json.results.bindings.length > 0 &&
					json.results.bindings[0].count) {
					loadAutoCompleteData(json.results.bindings[0].count.value,0);
				}
			}
		});
	}

	/**
	 * This method loads all resource names from our baseuri
	 */
	function loadAutoCompleteData(count,offset) {
		_callbacks = [];
		
		for(var i =0; i < Math.ceil(count/1000.0); i++) {
			_callbacks[i] = false;
		}
		
		while(offset < count) {
			loadResources(count, offset);
			
			offset+=1000;
		}
		
		waitForCallbacks(new Date().getTime());
		$("#homesearch #name").val('Introduce a city or county !');
		$('#homesearch #name').css('color', '#ccc');
		$("#homesearch #name").click(function() {
		if (true) {
			$("#homesearch #name").val('');
			$('#homesearch #name').css('color', '#000');
		}
		});
		$("#homesearch #name").focus();
	}

	/**
	 * This method waits until all of the baseuri requests have 
	 * completed or 30 seconds have elapsed (whichever happens 
	 * first) and then displays the auto complete field.
	 */
	function waitForCallbacks(startTime) {
		var test = true;
		for(var i =0; i < _callbacks.length; i++) {
			test = test && _callbacks[i];
		}
		if(test || (new Date().getTime() - startTime > 30000)) {
			renderAutoComplete();
		} else {
			setTimeout(function() {
				waitForCallbacks(startTime);
			}, 100);
		}
	}
	
	
	/**
	 * Use JQuery autocomplete (http://docs.jquery.com/Plugins/Autocomplete) 
	 * to render an autocomplete field over the data returned by baseuri
	 */
	function renderAutoComplete() {
		for(var key in _autoCompleteMap) {
			_autoCompleteArray.push(key);
		}
		//alert(_autoCompleteMap);
		//var html =  "<div class='searchbox'>" +
		//			"<form id='fulltext_form' method='get' action=''>" +
		//"<div> <input class='bigbutton go' value='go'> 	<\/div> <div> <input type='text' name='name' id='name' class='text search ui-autocomplete-input' style='color: rgb(204, 204, 204);' autocomplete='off' role='textbox' aria-autocomplete='list' aria-haspopup='true'>" +
		//		"<\/div>  <\/form> <\/div>";
			
		var html =  "<div class='searchbox'>Introduce a city or county" +
					"<form id='fulltext_form' method='get' action=''>" +
		" <div> <input type='text' name='name' id='name' class='text search ui-autocomplete-input' style='color: rgb(204, 204, 204);' autocomplete='off' role='textbox' aria-autocomplete='list' aria-haspopup='true'>" +
				"<\/div>  <\/form> <\/div>";
			
		$("#auto_complete_container").html(html);
		$("#homesearch #name").val('');
		$('#homesearch #name').css('color', '#ccc');
		$("#homesearch #name").click(function() {
		if (true) {
			$("#homesearch #name").val('');
			$('#homesearch #name').css('color', '#000');
		}
		});
		$("#homesearch #name").focus();
		 //var $searchBox = $('#mysearchBox');
		$("#name").autocomplete({
		open : function(event, ui) {
			$('.ui-autocomplete').addClass('homesearch')
		},
		select: function(event, ui) {
	
			//$('#name_loading').html("<img style='padding-left:7px; vertical-align:center;' src='resources/loading.gif'/>");
			//loadResource(_autoCompleteMap[ui.item.value], ui.item.value);
			
			locationURI = _autoCompleteMap[ui.item.value];
			locationName = ui.item.value;

			document.getElementById('homesearch').style.display='none';
			document.getElementById('result-container').style.display='block';
			
			loadThirdPartyData(locationURI,locationName);
			
			loadIndicators(locationURI);
			
		},
		source: _autoCompleteArray,
		minLength: 2,
		});
		
	}
	
	
	/**
	 * Query  for the names and URIs of up to 1000 items 
	 * that are of type _resourceType.
	 */

	function loadResources(count, offset) {
		// SPARQL query for getting the names and URIs of up to 1000 items 
			var sparql =
			"SELECT ?uri, ?name WHERE { " +
				//"?uri a <" + _resourceType + "> . " +
				" { ?uri a <" + _resourceType_County + "> } UNION { ?uri a <" + _resourceType_City + "> } . " +
			"?uri <"+ _nameProperty +"> ?name . " +			    	
			"} LIMIT 1000 OFFSET " + offset;

		//  URI for executing the sparql query. 
		var Url = _URIbase + escape(sparql) + "&format=json";
		
		// An ajax request that requests the above URI and parses the response. 
		$.ajax( {
			dataType :'jsonp',
			jsonp :'callback',
			url : Url,
			success : function(json) {
				if(json) {
					//alert(json);
					_callbacks[offset/1000] = true;
					var callbacksComplete = 0;
					for(var i =0; i < _callbacks.length; i++) {
						callbacksComplete += (_callbacks[i] ? 1 : 0);
					}
					var progress = Math.ceil((100.0*callbacksComplete)/(0.001*count));
					//$("#progressbar").progressbar( "option", "value", progress );
					//$("#progess_percent_complete").html(progress + "%");
					parseAutocompleteData(json);
				}
			}
		});
	}
	
	/**
	 * Method for parsing the names and URIs of resources from the response 
	 * to the SPARQL query made by the loadResources() method.
	 */
	function parseAutocompleteData(json) {
		if(json.results && json.results.bindings) {
			var bindings = json.results.bindings;
			//alert(bindings);
			for(var i =0; i < bindings.length; i++) {
				binding = bindings[i];
				if(binding.name && binding.uri) {
					console.log(binding.name);
					console.log(binding.uri);
					if(binding.uri.value.toLowerCase().indexOf("list_of") == -1) {
						var name = binding.name.value;
						
						var index = name.indexOf("(administrative)");
						if (index != -1)
							name = name.substring(0,index);
								
						_autoCompleteMap[name] = binding.uri.value;
					}
				}
			}
		}
	}
	
	
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
		document.getElementById('result-container').style.display='none';
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
		$("#tables").html(html);
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
		$("#auto_complete_container").html("<div style='margin:auto; width:300px;'> <center> <b>Initializing</b><br><br> <img style='padding-left:7px; vertical-align:center; width: 35px;' src='img/ajax-loader-search.gif'/> </center>");
	
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
							/* do it later
							if (property.locURI == locationURI) {
								position = i+1;
								value = property.val;
							}*/
							props[len++] = property;
						}
					}
					
					indicators[propURI] = props;
					
					/* do it later
					if (position != 0) {
						//console.log('property ' + propURI + '\tvalue ' + value + '\tposition ' + position );
						var size = positions.length;
						var pos = new Object();
						pos.position = position;
						pos.propURI = propURI;
						positions[size] = pos;
						//positions[propURI]=position;
						indicators[propURI] = props;
					} */
					if (propertyIndex == properties.length -1) {
						//selectPropertiesToDisplay();
						setupAutoComplete();
					}
				} 
			}
		});
	}

	
	function loadIndicators(locationURI) {
		var position;
		for (var i in indicators) {
			position = 0;
			var props = indicators[i];
			for (var k=0;k<props.length;k++) {
				var property = props[k];
				if (property.locURI == locationURI) {
					position = k+1;
					value = property.val;
				}
			}
			if (position != 0) {
				//console.log('property ' + propURI + '\tvalue ' + value + '\tposition ' + position );
				var size = positions.length;
				var pos = new Object();
				pos.position = position;
				pos.propURI = i;
				positions[size] = pos;
			} 
		}
		
		selectPropertiesToDisplay();
		
		positions = [];
		
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
		data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			data.setValue(i, 0, props[i].locLabel);
			//data.setValue(i, 0, props[i].locURI);
			data.setValue(i, 1, parseFloat(props[i].val));			

			}

		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_top_'+index));
		barsVisualization.draw(data, {width: 900, height: 500, title: props[0].label + ' - Position ' + position, legend:'none', backgroundColor: '#F7F7F7'});
	
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
		data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			data.setValue(i, 0, props[i].locLabel);
			//data.setValue(i, 0, props[i].locURI);
			data.setValue(i, 1, parseFloat(props[i].val));			

			}

		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_top_'+index));
		barsVisualization.draw(data, {width: 900, height: 500, title: props[0].label + ' - Position ' + position, legend:'none', backgroundColor: '#F7F7F7'});
	
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
        data.addColumn('number', /*bottomProperty*/props[0].label);
        data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			data.setValue(i, 0, props[i].locLabel);
			//data.setValue(i, 0, props[i].locURI);
			data.setValue(i, 1, parseFloat(props[i].val));			
			}

		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_bottom_'+index));
		barsVisualization.draw(data, {
			width: 900, 
			height: 500,
			is3D: true,
			colors:[{color:'#FF0000', darker:'#680000'}],
			title: props[0].label + ' - Position ' + position, 
			legend:'none',
			backgroundColor: '#F7F7F7'
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
        data.addColumn('number', /*bottomProperty*/props[0].label);
        data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			data.setValue(i, 0, props[i].locLabel);
			//data.setValue(i, 0, props[i].locURI);
			data.setValue(i, 1, parseFloat(props[i].val));			
			}

		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_bottom_'+index));
		barsVisualization.draw(data, {
			width: 900, 
			height: 500,
			is3D: true,
			colors:[{color:'#FF0000', darker:'#680000'}],
			title: props[0].label + ' - Position ' + position, 
			legend:'none',
			backgroundColor: '#F7F7F7'
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
	
	
	
	
	
	
	
	
	
	
	
	

	
	
