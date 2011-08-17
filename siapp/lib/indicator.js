
	var locationName;
	var locationURI;
	
	var indicatorYearURI = "<http://reference.data.gov.uk/id/year/2009>";
	var indicatorYear = "2009";
	var datasetGraph = "<http://data-gov.ie/graph/ssi>";
	var si2009Scheme = "<http://stats.data-gov.ie/codelist/geo/service-indicators-2009>";

	var numRegions = 0;
	var indicators = [];
	var positions = [];
	
	var topLevelInd = [];
	var topLevel2Ind = [];	
	
	var aboutLink = "javascript:alert('Service Indicators of Ireland');";

	var codeLink = "https://github.com/data-gov-ie/service-indicators";

	//var queryServer = "http://localhost:8890/sparql?query=";
	var queryServer = "http://data-gov.ie/sparql?query=";

	/* */
	$(document).ready(function() {
		var locParameterURI = getUrlVars('#'); //is there sth like #region-name?
		
		if (locParameterURI=="" && window.locationName == undefined) { //Access to the app from the first page - no parameteres
			loadIndicatorsObservations(false);
			buildFirstPageSkeleton();
			switchLayers('home');
			loadRegions();
			//alert('cuando me llamo <' + window.location.hash + '>');
		}
		else if (locParameterURI!="" && window.locationName == undefined) { //Access to the app asking for a uri of a particular county
			$('#result-container').hide();
			locParameterURI = locParameterURI.replace("-"," ");
			validateLocation(locParameterURI);
			
			loadIndicatorsObservations(true);
					
			

		}
	});
	
	function buildQueryForCheckingLocation(locParameterURI) {
		var sparql =
					"SELECT distinct ?uri ?label WHERE { " +
						"?uri <http://www.w3.org/2004/02/skos/core#inScheme> <http://stats.data-gov.ie/codelist/geo/top-level> . ?uri <http://www.w3.org/2004/02/skos/core#prefLabel> ?label . " +
						" ?uri <http://www.w3.org/2004/02/skos/core#prefLabel> ?label . " +
						" FILTER(REGEX(STR(?label), \"" + locParameterURI + "\" )) . " +
						"} ";
		return sparql;
	}
	
	function validateLocation(locParameterURI) {
		var sparql = buildQueryForCheckingLocation(locParameterURI);
		//var _URIbase = "http://data-gov.ie/sparql?query=";
		var _URIbase = queryServer;
		var Url = _URIbase + escape(sparql) + "&format=json";
		
	    console.log("validateLocation");
		console.log(Url);

		$.ajax( {
			dataType :'jsonp',
			jsonp :'callback',
			url : Url,
			error : function (jqXHR, textStatus, errorThrown) {
					alert('error al validar los locations ' + textStatus);
					console.log(sparql);
			},
			success : function(json) {
				if( json && 
					json.results && 
					json.results.bindings && 
					json.results.bindings.length > 0) {
					var rows = json.results.bindings;
			
					for(var i=0; i<rows.length; i++) {
						var row = rows[i];
						var label = row.label.value;
						if (label.indexOf("County")!=-1 && label.indexOf("administrative") != -1) {
							var index = label.indexOf("(administrative)");
							if (index != -1)
								label = label.substring(0,index);
							locationName = label;
							locationURI = row.uri.value;
						}
						if (label.indexOf("City") != -1 ) {
							locationName = row.label.value;
							locationURI = row.uri.value;
						}
					}

				}
				else {
					$("#loading_container").html("<center><b>There is no information in this sever about " + locParameterURI + "<\/b><\/center>");
				}
		}});
	}
	
	
	/*  function to hide/show layers - parameter page contains "home" "results"*/
	function switchLayers(page) {
		if (page=='home') {
			$('#result-container').hide();
			$('#map-content-holder').show();
			$('#regions-content-holder').show();
			$("#title-content-holder").show();
			window.location.hash = "";
			//positions = [];
		}
		else if (page=='results') {
			$('#result-container').show();
			$('#map-content-holder').hide();
			$('#regions-content-holder').hide();
			$("#title-content-holder").hide();			
		}
	}

	/** General purpose functions **/
	function getUrlVars(specialChar) {
		var thisURI = window.location.href;
		
		if (thisURI.indexOf(specialChar)==-1)
			return "";
		var vars = [], hash;
		var hashes = window.location.href.split(specialChar);

		if (hashes.length > 1)
			return hashes[1];
		return "";
	}
	
	
	/* Loads the names and uris of the cities and counties */	
	function loadRegions() {

		var _resourceType_County = "http://geo.data-gov.ie/AdministrativeCounty";
		var _resourceType_City = "http://geo.data-gov.ie/City";			
		var _nameProperty = "http://www.w3.org/2000/01/rdf-schema#label";

		var sparql =
					"SELECT distinct ?uri ?label WHERE { " +
						"?uri <http://www.w3.org/2004/02/skos/core#inScheme> <http://stats.data-gov.ie/codelist/geo/top-level> . ?uri <http://www.w3.org/2004/02/skos/core#prefLabel> ?label . " +
						" { ?uri a <" + _resourceType_County + "> } UNION { ?uri a <" + _resourceType_City + "> } } ORDER BY ?uri ";

		var _URIbase = queryServer;

		var queryURLBase = _URIbase + escape(sparql) + "&format=json";

		$.ajax( {
			dataType :'jsonp',
			jsonp :'callback',
			url : queryURLBase,
			error : function (jqXHR, textStatus, errorThrown) {

			},
			success : function(json) {
				if( json && 
					json.results && 
					json.results.bindings && 
					json.results.bindings.length > 0) {
					var rows = json.results.bindings;
					var cities = [];
					var counties = [];
					var iCities = 0;
					var iCounties = 0;
					for(i in rows) {
						var row = rows[i];
						var region = new Object;
						region.uri = row.uri.value;
						index = row.label.value.indexOf("(administrative)");
						if (index != -1)
							region.label = row.label.value.substring(0,index);
						else
							region.label = row.label.value;
						if (row.label.value.indexOf("City")!=-1) 
							cities[iCities++] = region; 
						else
							counties[iCounties++] = region;
					}
					
					displayRegions(cities,counties);
				}
		}});
	}
	
	/* Display the regions in a menu bar */
	function displayRegions(cities,counties) {
		//var html = "<div class=\"notes\"><p><em>Click on your city/county, from the list, to see the service indicators in your city/county!<\/em><\/p><\/div>";
		var html = "<div class='region' style='float:left'><ul><li><h2>County<\/h2><ul>";
		html += "<div class='region' style='float:left'><ul>";
		for(var i = 0; i < counties.length; i++) {
			var county = counties[i];
			var uname = county.label.replace(" ","-");
			//html += "<li><a href=\"#"+ uname +"\" onclick=\"javascript:setRegion('"+county.uri+"','"+county.label+"');return false;\">" + county.label + "<\/a><\/li>";
			html += "<li><a href=\"javascript:setRegion('"+county.uri+"','"+county.label+"');\">" + county.label + "<\/a><\/li>";
		}
		//html += "<\/ul><\/li><\/ul><ul><li><h2>City<\/h2><ul>"
		html += "<\/ul><\/li><\/ul></div><div class='region' style='float:left'><ul><li ><h2>City<\/h2><ul>"
		for(var i = 0; i < cities.length; i++) {
			var city = cities[i];
			var uname = city.label.replace(" ","-");
			//html += "<li><a href=\"#" + uname + "\" onclick=\"javascript:setRegion('"+city.uri+"','"+city.label+"');return false;\">" + city.label + "<\/a><\/li>";
			html += "<li><a href=\"javascript:setRegion('"+city.uri+"','"+city.label+"');\">" + city.label + "<\/a><\/li>";
		}
		html += "<\/ul><div>";
		$("#regions-content-holder").html(html);
	}

	/* Once the user has selected a region, we show the data for that region */
	function setRegion(uri,label) {
		locationName = label.trim();
		locationURI = uri;
		label = label.replace(" ","-");
		var localAdd = window.location.href;
		/*var cur_url = localAdd.indexOf("#");
		if (cur_url!=-1) {
			window.location.href = localAdd.substring(0,cur_url)
		}*/
		window.location.hash = label;
		//window.location.href = window.location.href + "#" + label;
		$("#location-title-holder").html(locationName);
		$("#location-main-holder").html("<center><a href=\""+locationURI+"\" target=\"_blank\">" + locationName + "</a> <br><br><p class='subtitle'>Service indicators for " +indicatorYear + "<\/p><\/center>");
		
		switchLayers('results');
				
		loadThirdPartyData(locationURI,locationName);

		calculatePositionOfRegionInIndicators(locationURI);
		displaySelectedIndicators();
		displayAllIndicators();
	}


	/** Functions related to the DBpedia **/
	/** Function to build a query for a given City/County **/
	function buildDBPediaQuery (name) {
		index = name.indexOf("City");
		var sparql;
		if (index==-1) {//it is a county
		    index = name.indexOf("County");
			var county = name.substring(index+7); 
			sparql = " SELECT distinct ?loc ?web ?img ?map ?wiki " + //+?area " +
					 " WHERE { " +
					 " ?loc a <http://dbpedia.org/ontology/Settlement> . " +
					 " ?loc <http://purl.org/dc/terms/subject> <http://dbpedia.org/resource/Category:Counties_of_the_Republic_of_Ireland> . " +
					 " ?loc <http://dbpedia.org/property/web> ?web . " +
					 " ?loc <http://dbpedia.org/ontology/thumbnail> ?img . " +
					 " ?loc <http://dbpedia.org/property/mapImage> ?map . " +
					 " ?loc <http://www.w3.org/2000/01/rdf-schema#label> ?label . " +
					 " ?loc <http://xmlns.com/foaf/0.1/page> ?wiki . " +
					 //" ?loc <http://dbpedia.org/property/areaKm> ?area . " +
					 " FILTER(REGEX(STR(?label), \"" + county + "\" )) . " +
					 " } ";
		}
		else  {// it is a city
			var city = name.substring(0,index); 
			sparql = " SELECT distinct ?loc ?web ?img ?wiki " +
					 " WHERE { " +
					 " ?loc a <http://dbpedia.org/ontology/Place> . " +
					 " ?loc <http://purl.org/dc/terms/subject> <http://dbpedia.org/resource/Category:Cities_in_the_Republic_of_Ireland> . " +
					 " ?loc <http://dbpedia.org/property/website> ?web . " +
					 " ?loc <http://dbpedia.org/ontology/thumbnail> ?img . " +
					 " ?loc <http://www.w3.org/2000/01/rdf-schema#label> ?label . " +
					 " ?loc <http://xmlns.com/foaf/0.1/page> ?wiki . " +
					 " FILTER(REGEX(STR(?label), \"" + city + "\" )) . " +
					 " } " ;
		}
		//console.log(sparql);
		return sparql;
	}
	
	/** Function to load data from DBpedia for a given City/County (uri and name) **/
	function loadDBpediaData(uri,name) {
		var sparql = buildDBPediaQuery(name);
		_URIbase = "http://dbpedia.org/sparql?query=";
		var queryURLBase = _URIbase + escape(sparql) + "&format=json";
		
		console.log("loadDBpediaData");
		console.log(queryURLBase);	
		
		
		var region = new Object;
		$.ajax( {
			dataType :'jsonp',
			jsonp :'callback',
			url : queryURLBase,
			error : function () {
					//alert('error al llamar a dbpedia');
			},
			success : function(json) {
				if( json && 
					json.results && 
					json.results.bindings && 
					json.results.bindings.length > 0) {
					var rows = json.results.bindings;
					var regions = [];
					for(i in rows) {
						var row = rows[i];
						region.name = row.wiki.value;
						region.web = row.web.value;
						if (region.web.indexOf("http")==-1)
							region.web ="http://"+region.web;
						region.img = row.img.value;
						//region.area = row.area.value;
						regions[i] = region; 
					}
					displayDBpediaData(region);
				}
		}});
	}
	
	/** Function to display dbpedia data for a given city/county - region is an internal object **/
	function displayDBpediaData(region) {
		
		var img = "img/no-image.gif";
		
		if (locationName.indexOf("County")!=-1)
			img = region.img;
		
		
		var threshold   = 500,
		successFunc = function(){ 
		 console.log('It exists!');
			$("#dbpedia-content-holder").html("<p class='dbpedia-text'><a href=\""+region.name+"\" target='_blank'>" + locationName + " in wikipedia </a><br>" + "<img src=\"" + img + "\"><br><a href=\""+region.web+"\" target=\"_blank\">" + region.web +"<\/a> <\/p>"); //  + area );
		};
		var myXHR = $.ajax({
		  url: $("<a href=\""+ region.img + "\"").attr('href'),
		  type: 'text',
		  method: 'get',
		  error: function() {
		  console.log('file does not exist');
			$("#dbpedia-content-holder").html("<p class='dbpedia-text'><a href=\""+region.name+"\" target='_blank'>" + locationName + " in wikipedia </a><br>" + "<a href=\""+region.web+"\" target=\"_blank\">" + region.web +"<\/a> <\/p>"); //  + area );
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
		//alert(name);
		index = name.indexOf("County");
		if (index!=-1) {
			name = name.substring(index+7); 
		}
		else {
			index = name.indexOf("City");
			name = name.substring(0,index-1);
		}
	    name = name.toLowerCase();
		//alert(name);
		var sparql = " PREFIX qb: <http://purl.org/linked-data/cube#> " +
					 " PREFIX property: <http://stats.data-gov.ie/property/>  " +
					 " SELECT ?pop " +
					 " WHERE { " +
					" <http://stats.data-gov.ie/data/persons-by-ethnic-background/2006/" + name + "/total> property:population ?pop . " +
 					 " } ";
		
		return sparql;
	}	

	/** Function to load data from census for a given City/County (uri and name) **/	
	function loadCensusData(uri,name) {
		var sparql = buildCensusQuery(uri,name);
		_URIbase =  "http://data-gov.ie/sparql?query="; //queryServer;
		//console.log(sparql);
		var queryURLBase = _URIbase + escape(sparql) + "&format=json";
		var region = new Object;
		
		console.log("loadCensusData");
		console.log(queryURLBase);	

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
		$("#census-content-holder").html("<p class='dbpedia-text'>Population " + region.population +"<\/p>" );
	}
	
	/** Function to load data from external resources **/
	function loadThirdPartyData(uri, name) {
		loadDBpediaData(uri, name); //there are some problems now ...
		loadCensusData(uri,name);
	}
	
	/** Functions related to the service indicators **/
	/* This function loads the whole set of triples 
	   and generate an array of elements
	   each element has ?prop ?proplabel ?geo ?geolabel ?val
	*/
	function loadIndicatorsObservations(forASingleCounty) {
		$("#loading_container").html("<div style='margin:auto; width:300px; float:center'> <center> <b>Loading</b><br><br> <img style='padding-left:7px; vertical-align:center; width: 40px;' src='img/ajax-loader.gif'/> </center>");
		_URIbase = queryServer;
		var sparql = " PREFIX data: <http://stats.data-gov.ie/data/> " +
					 " PREFIX qb: <http://purl.org/linked-data/cube#> " +
					 " PREFIX dimension: <http://purl.org/linked-data/sdmx/2009/dimension#> " +
					 " PREFIX property: <http://stats.data-gov.ie/property/> " +
					 " PREFIX skos: <http://www.w3.org/2004/02/skos/core#>  " +
					 " SELECT distinct ?top1label ?top2label ?prop ?proplabel ?geo ?geolabel ?val " +
					 " WHERE { " +
					 " GRAPH " + datasetGraph + " { " +
					 " ?obs a qb:Observation . " +
					 " ?obs dimension:refPeriod " + indicatorYearURI + "." +
					 " ?obs property:geoArea ?geo . " + 
					 " ?geo skos:prefLabel ?geolabel . " +					 
					 " ?obs ?prop ?val . " +
					 " ?prop a qb:MeasureProperty . " +
					 " ?prop <http://www.w3.org/2000/01/rdf-schema#label> ?proplabel . " +
					 " ?prop qb:concept ?concept . " +
					 " ?concept skos:inScheme " + si2009Scheme  + " . " +
					 " ?concept skos:broader ?top2 . " +
					 " ?top2 skos:broader ?top1 . " + 
					 " ?top2 skos:altLabel ?top2label . " +
					 " ?top1 skos:altLabel ?top1label . " +
					 " } " +
					 " } ORDER BY ?top1label ";
		var Url = _URIbase + escape(sparql) + "&format=json";
		var len = 0;
			
		console.log("loadProperties");
		console.log(Url);

		// An ajax request that requests the above URI and parses the response. 
		$.ajax( {
			dataType :'jsonp',
			jsonp :'callback',
			url : Url,
			error: function (jqXHR, textStatus, errorThrown) {
				alert('Error when accessing data when loading the properties ' + textStatus);
			},
			success : function(json) {
				if( json && 
					json.results && 
					json.results.bindings && 
					json.results.bindings.length > 0) {
					var bindings = json.results.bindings;
					var localIndicators = [];
					var localProps = [];
					var localRegions = [];
					var len = 0;
					for (var i=0; i<bindings.length; i++) {
						// in each row we have ?prop ?proplabel ?geo ?geolabel ?val
						var row = bindings[i];
						var property = new Object;
						property.top1label = row.top1label.value.toUpperCase();
						property.top2label = row.top2label.value;
						property.prop = row.prop.value;
						property.proplabel = row.proplabel.value;
						property.geo = row.geo.value;
						property.geolabel = row.geolabel.value;
						property.val = row.val.value;
						//remover the (administrative) from the label
						index = property.geolabel.indexOf("(administrative)");
						if (index != -1)
							property.geolabel = property.geolabel.substring(0,index);
						
						localProps[property.prop] = property.proplabel;
						localRegions[property.geo] = property.geolabel; //keep it just in case
						localIndicators[len++] = property;
						topLevelInd[property.top1label] = property.top1label;
						topLevel2Ind[property.top2label] = property.top2label;
						
					}
					
					processIndicatorsObservations(localIndicators,localProps,localRegions);
					$("#loading_container").html("");			
					
					
					if (forASingleCounty) {
					
						loadThirdPartyData(locationURI,locationName);
						calculatePositionOfRegionInIndicators(locationURI);
						displaySelectedIndicators();
						displayAllIndicators();
						
						//buildFirstPageSkeleton();
						switchLayers('results');
						
						$("#location-title-holder").html(locationName);
						$("#location-main-holder").html("<center><a href=\""+locationURI+"\" target=\"_blank\">" + locationName + "</a> <br><br><p class='subtitle'>Service indicators for " +indicatorYear + "<\/p><\/center>");

						
					}

					
				} 
				// If we did not find any indicator
				// display an error message.  
				else {
					$('#name_loading').html("");
					var html = "<div id='missing'>No indicators were found. <\/div>";
					$("#content-holder").html(html);
				}
			}
		});					 
	}

	function processIndicatorsObservations(localIndicators,localProps,localRegions) {
		var mean = 0;
		var len = 0;
		for (var propURI in localProps) {
			var props = []
			mean = 0;
			len = 0;
			for (var j=0;j<localIndicators.length;j++) {
				var property = localIndicators[j];
				if (property.prop==propURI ) {
					mean = mean + parseFloat(property.val);
					var propertyGroupByURI = new Object();
					propertyGroupByURI.top1label = property.top1label;
					propertyGroupByURI.top2label = property.top2label;
					propertyGroupByURI.prop = property.prop;
					propertyGroupByURI.proplabel = property.proplabel;
					propertyGroupByURI.geo = property.geo;
					propertyGroupByURI.geolabel = property.geolabel;
					propertyGroupByURI.val = property.val;
					props[len++] = propertyGroupByURI;
				}
			}			
			mean = mean / len;			//get mean for that property
			var meanProperty = new Object();
			meanProperty.top1label = propURI;
			meanProperty.top2label = propURI;
			meanProperty.prop = propURI;
			meanProperty.proplabel = localProps[propURI];
			meanProperty.geo = 'Average';
			meanProperty.geolabel = 'Average';
			meanProperty.val = mean;
			props[len++] = meanProperty;
			
			props.sort( function (a,b) { 
							return parseFloat(b.val) - parseFloat(a.val);
						} );
			
			indicators[propURI] = props;
		}
		
		numRegions = 0;
		//calculate the toal of regions
		for (var propRegion in localRegions)
			numRegions++;
		
		
	}
	
	function calculatePositionOfRegionInIndicators(locationURI) {
		var position;
		var val;
		for (var propURI in indicators) {
			position = 0;
			val = 0;
			var props = indicators[propURI];
			for (var k=0;k<props.length;k++) {
				var property = props[k];
				if (property.geo == locationURI) {
					position = k+1;
					val = property.val;
				}
			}
			if (position != 0) {
				//console.log('----------------property ' + propURI + '\tvalue ' + value + '\tposition ' + position );
				var size = positions.length;
				var pos = new Object();
				pos.position = position;
				pos.propURI = propURI;
				pos.propLabel = props[0].proplabel
				pos.parent = props[0].top2label;
				pos.top = props[0].top1label;
				pos.val = val;
				positions[size] = pos;
			} 
		}			

	}
	
		/** Function to select the properties to display, two top properties, and two bottom properties **/	
	function displaySelectedIndicators() {
		//order the array
		positions.sort( function (a,b) 
			{ 
				return b.position - a.position;
			} );
			
		displayChartTopProperty1(positions[positions.length-1].propURI,positions[positions.length-1].position,1);
		displayChartTopProperty2(positions[positions.length-2].propURI,positions[positions.length-2].position,2);
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
        data.addColumn('number', props[0].proplabel);
		data.addColumn('number', props[0].proplabel);
		data.addColumn('number', props[0].proplabel);
		data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			data.setValue(i, 0, props[i].geolabel);
			if (props[i].geo == locationURI) 
				data.setValue(i, 3, parseFloat(props[i].val));			
			else if (props[i].geo == 'Average') 
				data.setValue(i, 2, parseFloat(props[i].val));
			else
				data.setValue(i, 1, parseFloat(props[i].val));
		}
		
		$('#first-position-parents-description').html("<ul><li><p class='position-top-description'>" + props[0].top1label + "<\/p><\/li><ul><li><p class='position-top-description'>" +  props[0].top2label +  "<\/p></li><\/ul><\/ul>");
		
		$('#first-position').html("<p class='position'># " + position +"&nbsp;&nbsp;</p>");
		$('#first-position-description').html("<p class='position-description'>\t" + props[0].proplabel +"</p>");		
		
		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_top_'+index));
		barsVisualization.draw(data, {width: 900, height: 500, colors:['#736F6E','#382D2C','#306754'], legend:'none', isStacked:'true', backgroundColor: '#F7F7F7', hAxis:{textStyle: {color: "black", fontName: "sans-serif", fontSize: 13} } }); //,  vAxis: {title:'hola', titleTextStyle:'', color: '#FF0000' }
	
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
        data.addColumn('number', /*topProperty*/props[0].proplabel);
		data.addColumn('number', props[0].proplabel);	
		data.addColumn('number', props[0].proplabel);		
		data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			data.setValue(i, 0, props[i].geolabel);
			if (props[i].geo == locationURI) 
				data.setValue(i, 3, parseFloat(props[i].val));			
			else if (props[i].geo == 'Average') 
				data.setValue(i, 2, parseFloat(props[i].val));
			else
				data.setValue(i, 1, parseFloat(props[i].val));
		
		}
		
		$('#second-position-parents-description').html("<ul><li><p class='position-top-description'>" + props[0].top1label + "<\/p><\/li><ul><li><p class='position-top-description'>" +  props[0].top2label +  "<\/p></li><\/ul><\/ul>");

		$('#second-position').html("<p class='position'># " + position +"&nbsp;&nbsp;</p>");
		$('#second-position-description').html("<p class='position-description'>\t" + props[0].proplabel +"</p>");		
			
		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_top_'+index));
		barsVisualization.draw(data, {width: 900, height: 500, colors:['#736F6E','#382D2C','#306754'], legend:'none', isStacked:'true', backgroundColor: '#F7F7F7', hAxis:{textStyle: {color: "black", fontName: "sans-serif", fontSize: 13} } } ); //vAxis: {title:'hola', titleTextStyle:'', color: '#FF0000' }
	
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
        data.addColumn('number', props[0].proplabel);
		data.addColumn('number', props[0].proplabel);
		data.addColumn('number', props[0].proplabel);
        data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			data.setValue(i, 0, props[i].geolabel);
			if (props[i].geo == locationURI) 
				data.setValue(i, 3, parseFloat(props[i].val));			
			else if (props[i].geo == 'Average') 
				data.setValue(i, 2, parseFloat(props[i].val));
			else
				data.setValue(i, 1, parseFloat(props[i].val));
		
		}

		$('#first-last-position-parents-description').html("<ul><li><p class='position-top-description'>" + props[0].top1label + "<\/p><\/li><ul><li><p class='position-top-description'>" +  props[0].top2label +  "<\/p></li><\/ul><\/ul>");		
		
		$('#first-last-position').html("<p class='position'># " + position +"&nbsp;&nbsp;</p>");
		$('#first-last-position-description').html("<p class='position-description'>\t" + props[0].proplabel +"</p>");		

			
		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_bottom_'+index));
		barsVisualization.draw(data, {
			width: 900, 
			height: 500,
			colors:['#736F6E','#382D2C','#7E2217'],
			isStacked:'true',
			legend:'none',
			backgroundColor: '#F7F7F7',
			hAxis:{textStyle: {color: "black", fontName: "sans-serif", fontSize: 13} }
			});
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
        data.addColumn('number', props[0].proplabel);
		data.addColumn('number', props[0].proplabel);
		data.addColumn('number', props[0].proplabel);
        data.addRows(props.length);

		for (var i=0; i<props.length; i++) {
			data.setValue(i, 0, props[i].geolabel);
			//data.setValue(i, 0, props[i].locURI);
			if (props[i].geo == locationURI) 
				data.setValue(i, 3, parseFloat(props[i].val));			
			else if (props[i].geo == 'Average') 
				data.setValue(i, 2, parseFloat(props[i].val));
			else
				data.setValue(i, 1, parseFloat(props[i].val));
		}
		
		$('#second-last-position-parents-description').html("<ul><li><p class='position-top-description'>" + props[0].top1label + "<\/p><\/li><ul><li><p class='position-top-description'>" +  props[0].top2label +  "<\/p></li><\/ul><\/ul>");

		$('#second-last-position').html("<p class='position'># " + position +"&nbsp;&nbsp;</p>");
		$('#second-last-position-description').html("<p class='position-description'>" + props[0].proplabel +"</p>");		

		var barsVisualization = new google.visualization.ColumnChart(document.getElementById('chart_div_bottom_'+index));
		barsVisualization.draw(data, {
			width: 900, 
			height: 500,
			colors:['#736F6E','#382D2C','#7E2217'],
			isStacked:'true',
			legend:'none',
			backgroundColor: '#F7F7F7',
			hAxis:{textStyle: {color: "black", fontName: "sans-serif", fontSize: 13} }
			});
	}
	
	/** Function to list of all indicators on the county pages with 
		indicator name, indicator value, and rank, with a horizontal bar that shows the rank (long green bar = #1, short red bar = last) 
	**/		
	function displayAllIndicators() {
		var html = "<ul id=\"treemenu1\" class=\"treeview\">";
		var color;
		var size;
		var bar = "";
		var completeBar;
		var mean = numRegions / 2;
		for (m in topLevelInd) {
			html += "<li>" + topLevelInd[m] + "<ul rel=\"open\">"
			for (var i=0; i<positions.length; i++) {
				var current = positions[i];
				bar = "";
				if (current.top == topLevelInd[m]) {					
					//console.log('current.position ' + current.position + ' mean ' + mean);
					if (current.position > mean)
						color = '#306754';
					else
						color = '#7E2217';
					var presize = 300 * current.position / numRegions;
					size = parseInt(presize);
					//completeBar = "<div style=\"width: 15px; height: 15px; background:" + color + ";\">" + bar + "</div>";
					completeBar = "<div style= 'background-color:" + color + "; height:10px; width:" + size +"px;' />" 
					//console.log(completeBar);
					html += "<li>" +  current.propLabel + ": " + current.val + "  " + completeBar +"</li>";
				}
			}
			html += "</ul></li>"
		}
		html += "</ul>"
		$('#indicator-list').html("<div class=\"notes\"><p>List of indicators</p></div><br>" + html);
		//ddtreemenu.createTree(treeid, enablepersist, opt_persist_in_days (default is 1))
		ddtreemenu.createTree("treemenu1", true, 5);
	}
	