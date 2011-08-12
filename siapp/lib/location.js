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

			/* toogleMenu*/
		var toggleMenu = {
		init : function(sContainerClass, sHiddenClass) {
		if (!document.getElementById || !document.createTextNode) {return;} // Check for DOM support
		var arrMenus = this.getElementsByClassName(document, 'ul', sContainerClass); // Find all menus
		alert('p');
		var arrSubMenus, oSubMenu, oLink;
		for (var i = 0; i < arrMenus.length; i++) { // In each menu...
		arrSubMenus = arrMenus[i].getElementsByTagName('ul'); // ...find all sub menus
		for (var j = 0; j < arrSubMenus.length; j++) { // For each sub menu...
		oSubMenu = arrSubMenus[j];
		oLink = oSubMenu.parentNode.getElementsByTagName('a')[0]; // ...find the link that toggles it...
		oLink.onclick = function(){toggleMenu.toggle(this.parentNode.getElementsByTagName('ul')[0], sHiddenClass); return false;} // ... add an event handler to the link...
		this.toggle(oSubMenu, sHiddenClass); // ... and hide the sub menu
		}
		}
		},
		toggle : function(el, sHiddenClass) {
		var oRegExp = new RegExp("(^|\\s)" + sHiddenClass + "(\\s|$)");
		el.className = (oRegExp.test(el.className)) ? el.className.replace(oRegExp, '') : el.className + ' ' + sHiddenClass; // Add or remove the class name that hides the element
		},
		/* addEvent and getElementsByClassName functions omitted for brevity */
		};
		// Initialise the menu
		//toggleMenu.addEvent(window, 'load', function(){toggleMenu.init('menu','hidden');});
		}
		});			
			
			
	
	}
	

	
	function displayRegions(cities,counties) {
		/*var html = "<div><table width='50%'><tr><th align='left' width='50%'>Counties<\/th><th align='left' width='50%'>Cities<\/th><\/tr>";
		var indicatorPage = "indicator.html";
		//we know there are more counties than cities
		for(var i = 0; i < counties.length; i++) {
			var city;
			var county = counties[i];
			
			var regionName;
			regionName = county.label;
			if (i<cities.length) {
				city = cities[i];
				*html += "<tr><td>" +
					"<a href='"+ indicatorPage +"?uri="+county.uri+"&name="+county.label+"' style='text-decoration: none;'>" + county.label + "<\/a><\/td>" +
					"<td><a href='"+ indicatorPage +"?uri="+city.uri+"&name="+city.label+"' style='text-decoration: none;'>" + city.label + "<\/a><\/td><\/tr>" ;*
				html += "<tr><td>" +
						"<a href='"+ indicatorPage +"?uri="+county.uri+"&name="+county.label+"'>"  + county.label + "<\/a><\/li><\/td>" +
						"<td><a href='"+ indicatorPage +"?uri="+city.uri+"&name="+city.label+"' style='text-decoration: none;'>" + city.label + "<\/a><\/td><\/tr>" ;
			}
			else
				html += "<td>" +
						"<a href='"+ indicatorPage +"?uri="+county.uri+"&name="+county.label+"' style='text-decoration: none;'>" + county.label + "<\/a><\/td><td><\/td><\/tr>";
		}
		html += "<\/tr><\/td><\/table><\/div>";
		$("#content-holder").html(html);*/

		var html = "<ul class='menu'>";
		var indicatorPage = "indicator.html";
		html += "<li><a href='#'>Counties<\/a><ul>" ;
		
		for(var i = 0; i < counties.length; i++) {
			var county = counties[i];
			html += "<li><a href='"+ indicatorPage +"?uri="+county.uri+"&name="+county.label+"'>" + county.label + "<\/a><\/li>";
		}
		html += "<\/ul><\/li><li><a href='#'>Cities<\/a><ul>"
		for(var i = 0; i < cities.length; i++) {
			var city = cities[i];
			html += "<li><a href='"+ indicatorPage +"?uri="+city.uri+"&name="+city.label+"'>" + city.label + "<\/a><\/li>";
		}
		html +="<\/ul><\/li></ul>";
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