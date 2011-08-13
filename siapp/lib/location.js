	var aboutLink = "#";
	var codeLink = "#";

	$(document).ready(function() {
		loadResources();
	
	});

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
	
	function displayRegions(cities,counties) {
		var html = "<div id='menu'><ul><li><h2>County<\/h2><ul>";
		var indicatorPage = "indicator.html";
	
		for(var i = 0; i < counties.length; i++) {
			var county = counties[i];
			html += "<li><a href='"+ indicatorPage +"?uri="+county.uri+"&name="+county.label+"'>" + county.label + "<\/a><\/li>";
		}
		html += "<\/ul><\/li><\/ul><ul><li><h2>City<\/h2><ul>"
		for(var i = 0; i < cities.length; i++) {
			var city = cities[i];
			html += "<li><a href='"+ indicatorPage +"?uri="+city.uri+"&name="+city.label+"'>" + city.label + "<\/a><\/li>";
		}
		html +="<\/ul><\/li><\/ul><ul><li><h2>&nbsp;<\/h2><\/li><\/ul><ul><li><a href='" + aboutLink + "' target='_blank' class='nivel1'>ABOUT</a><\/li><\/ul>" +							
			   "<ul><li><a href='" + codeLink + "' target='_blank' class='nivel1'>CODE</a></li></ul>"							
		$("#content-holder").html(html);
	}
	
