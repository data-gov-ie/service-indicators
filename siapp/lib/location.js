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
					"<a href='"+ indicatorPage +"?uri="+region.uri+"&name="+region.label+"'>" + region.label + "<\/a><\/td><td>" +
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