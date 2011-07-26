	$(document).ready(function() {
		var uri = getUrlVars()["uri"];
		var name = getUrlVars()["name"];
		name = decodeURIComponent(name);
		loadThirdPartyData(uri,name);
		loadIndicators(uri, name);
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
	
	function buildDBPediaQuery (name) {
		index = name.indexOf("City");
		var sparql;
		if (index==-1) {//it is a county
		    index = name.indexOf("County");
			var county = name.substring(index+7); 
			sparql = " SELECT distinct ?loc ?web ?img ?map " +
					 " WHERE { " +
					 " ?loc a <http://dbpedia.org/ontology/Settlement> . " +
					 " ?loc <http://purl.org/dc/terms/subject> <http://dbpedia.org/resource/Category:Counties_of_the_Republic_of_Ireland> . " +
					 " ?loc <http://dbpedia.org/property/web> ?web . " +
					 " ?loc <http://dbpedia.org/ontology/thumbnail> ?img . " +
					 " ?loc <http://dbpedia.org/property/mapImage> ?map . " +
					 " ?loc <http://www.w3.org/2000/01/rdf-schema#label> ?label . " +
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
				region.img = row.img.value;
				regions[i] = region; 
			}
			//displayDBData(region);
			}
		});
	}
	
	
	function buildCensusQuery (uri) {
		var sparql = " SELECT distinct ?loc ?web ?img ?map " +
					 " WHERE { " +
					 " ?loc a <http://dbpedia.org/ontology/Settlement> . " +
					 " ?loc <http://purl.org/dc/terms/subject> <http://dbpedia.org/resource/Category:Counties_of_the_Republic_of_Ireland> . " +
					 " ?loc <http://dbpedia.org/property/web> ?web . " +
					 " ?loc <http://dbpedia.org/ontology/thumbnail> ?img . " +
					 " ?loc <http://dbpedia.org/property/mapImage> ?map . " +
					 " ?loc <http://www.w3.org/2000/01/rdf-schema#label> ?label . " +
					 " FILTER(REGEX(?label, \"" + county + "\" )) . " +
					 " } ";
	}	

	function loadCensusData(uri,name) {
		var sparql = buildCensusQuery(uri);
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
				region.name = row.loc.value;
				region.web = row.web.value;
				region.img = row.img.value;
				regions[i] = region; 
			}
			//displayDBData(region);
			}
		});
	}

	
	function loadThirdPartyData(uri, name) {
		loadDBpediaData(uri, name);
		loadCensusData(uri,name);
	}
	
	
	
	
	function loadIndicators(resourceUri,resourceName) {
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
			
		var sparql = " PREFIX scv: <http://purl.org/NET/scovo#>  " +
					 " SELECT ?uri ?plabel ?alabel ?val ?year " +
					 " WHERE { " +
					 " ?uri scv:dimension <" + resourceUri + "> . " +
					 " ?uri    rdfs:label ?label . " +
					 " ?uri      rdf:value ?val . " +
					 " ?uri      scv:dimension ?ind . " +
					 " ?ind a <http://www.w3.org/2004/02/skos/core#Concept> . " +
					 " ?ind     <http://www.w3.org/2004/02/skos/core#prefLabel> ?plabel ." +
					 " ?ind     <http://www.w3.org/2004/02/skos/core#altLabel> ?alabel . " +
					 " ?uri scv:dimension ?y . " +
					 " ?y a <http://data-gov.ie/ontology/Year> . " +
					 " ?y    <http://data-gov.ie/ontology/name> ?year . " +
					 "} ORDER BY ?ind";
		
		
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
					_indicators_2009 = parseBindingsByYear(bindings,'2009');
					_indicators_2010 = parseBindingsByYear(bindings,'2010');
					//alert(bindings);

					// render the manifestation table
					$('#content-holder').html("");
					//displayIndicators();
					
					displayChartIndicators();
					

				} 

				// If we did not find any scv:item for the specified 
				// resource, display an error message.  
				else {
					$('#name_loading').html("");
					var html = "<div id='missing'>No indicators were found for  " + resourceName + "<\/div>";
					$("#content-holder").html(html);
				}
			}
		});
	}


	function loadResources() {
		var _resourceType_County = "http://geo.data-gov.ie/AdministrativeCounty";
		var _resourceType_City = "http://geo.data-gov.ie/City";			
		var _nameProperty = "http://www.w3.org/2000/01/rdf-schema#label";

		var sparql =
					"SELECT ?uri ?label WHERE { " +
						"?uri <http://www.w3.org/2004/02/skos/core#inScheme> <http://stats.data-gov.ie/codelist/geo/top-level> . ?uri <http://www.w3.org/2004/02/skos/core#prefLabel> ?label . " +
						" { ?uri a <" + _resourceType_County + "> } UNION { ?uri a <" + _resourceType_City + "> } } ORDER BY ?uri ";

		var _URIbase = "http://data-gov.ie/sparql?query=";

		var queryURLBase = _URIbase + escape(sparql) + "&format=json";

		$.getJSON(queryURLBase, function(data, textStatus){
		if(data.results) {
			var rows = data.results.bindings;
			var regions = [];
			for(i in rows) {
				var row = rows[i];
				var region = new Object;
				region.uri = row.uri.value;
				index = row.label.value.indexOf("(administrative)");
				if (index != -1)
					region.label = row.label.value.substring(0,index);
				else
					region.label = row.label.value;
				
				regions[i] = region; 
			}
			displayRegions(regions);
			displayRegionsOnMap();
		}
		});
	}
	
	function displayRegions(regions) {
		var html = " <div> <table> <tbody> ";
		var indicatorPage = "locationSI.html";
		for(var i = 0; i < regions.length; i++) {
			var region = regions[i];
			var labelfancy = "'a#iframe2"+ i +"'";
			html += "<tr>" +
					"<td>" +
					"<a href='"+ indicatorPage +"?location="+region.uri+"'>" + region.label + "<\/a><\/td><td>" +
					"<a id='iframe2"+i+"' href='"+region.uri+"' target=\"_blank\">description<\/a><\/td><\/tr>";
		}
		html += " <\/tbody><\/table>";
		html += "<\/div>";
		$("#content-holder").html(html);
	}
	
	function displayRegionsOnMap() {
				var data = new google.visualization.DataTable();
				data.addRows(6);

				data.addColumn('string', 'Country');
				data.addColumn('number', 'Popularity');

				data.setValue(0, 0, 'EI01');
				data.setFormattedValue(0, 0, 'EI01');

				data.setValue(0, 1, 200);

				data.setValue(1, 0, 'EI02');
				data.setFormattedValue(1, 0, 'EI02');

				data.setValue(1, 1, 300);

				data.setValue(1, 0, 'EI31');
				data.setFormattedValue(1, 0, 'EI31');
				data.setValue(1, 1, 300);
				
				data.setValue(2, 0, 'EI28');
				data.setFormattedValue(2, 0, 'EI28');
				data.setValue(2, 1, 300);
				

				var options = {};
					 options['region'] = 'IE';
					 options['resolution'] = 'provinces';
					 options['width'] = 556;
					 options['height'] = 347;

				 var geochart = new google.visualization.GeoChart(document.getElementById('visualization'));
				 geochart.draw(data,options);
		
	}