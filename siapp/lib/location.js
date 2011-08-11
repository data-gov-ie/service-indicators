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
			//displayRegionsOnMap();
		}
		});
	}
	
	function displayRegions(cities,counties) {
		var html = "<div><table><tr><th align='center'>Counties<\/th><th align='center'>Cities<\/th><\/tr>";
		var indicatorPage = "indicator.html";
		//we know there are more counties than cities
		for(var i = 0; i < counties.length; i++) {
			var city;
			var county = counties[i];
			
			var regionName;
			regionName = county.label;
			if (i<cities.length) {
				city = cities[i];
				html += "<tr><td>" +
					"<a href='"+ indicatorPage +"?uri="+county.uri+"&name="+county.label+"'>" + county.label + "<\/a><\/td>" +
					"<td><a href='"+ indicatorPage +"?uri="+city.uri+"&name="+city.label+"'>" + city.label + "<\/a><\/td><\/tr>" ;
			}
			else
				html += "<td>" +
						"<a href='"+ indicatorPage +"?uri="+county.uri+"&name="+county.label+"'>" + county.label + "<\/a><\/td><td><\/td><\/tr>";
		}
		html += "<\/table><\/div>";
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