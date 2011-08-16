	function buildFirstPageSkeleton() {
	
			var html_menu ="<div id=\"menu\"><ul><li><a href=\"javascript:switchLayers(\'home\');\" class=\"nivel1\">HOME<\/a><\/li><\/ul><ul><li><a href=\"" + aboutLink + "\" class=\"nivel1\">ABOUT</a><\/li><\/ul>" +							
			"<ul><li><a href=\"" + codeLink + "\" target=\"_blank\" class=\"nivel1\">CODE</a></li></ul><\/div>";
			$("#content-holder").html(html_menu);
			
			$("#title-content-holder").html("<p class='service-subtitle'> Service Indicators - Ireland <\/p>");

			/*
			$("#map-content-holder").html("<div id=\"ireland_map\">" +
						   "<div class=\"notes\"><p><em>Click on your city/county to see the service indicators in your county!<\/em><\/p><\/div>" +	
						   "<img class=\"map\" src=\"img/ireland-map.png\" usemap=\"#ireland\">" +
						   "<map name=\"ireland\">" +
						   "<area href=\"#Galway-City\" onclick=\"javascript:setRegion('http://geo.data-gov.ie/city/galway','Galway City');return false;\" title=\"Galway City\" id=\"GalwayCityarea\" shape=\"poly\" " +
						   "coords=\"167,312,157,312,157,321,167,321\"></area> " + 
						   "<area href=\"#Dublin-City\" onclick=\"javascript:setRegion('http://geo.data-gov.ie/city/dublin','Dublin City');return false;\" title=\"Dublin City\" id=\"DublinCityarea\" shape=\"poly\" " +
						   "coords=\"398,317,389,317,389,325,398,325\"></area>" +
						   "<area href=\"Limerick-City\" onclick=\"javascript:setRegion('http://geo.data-gov.ie/city/limerick','Limerick City');return false;\" title=\"Limerick City\" id=\"LimerickCityarea\" " +
						   "shape=\"poly\" coords=\"202,404,192,404,192,414,202,414\"></area> " +
						   "<area href=\"#Waterford-City\" onclick=\"javascript:setRegion('http://geo.data-gov.ie/city/waterford','Waterford City');return false;\" title=\"Waterford City\" id=\"Waterfordarea\" " +
						   "shape=\"poly\" coords=\"316,465,306,465,306,475,316,475\"></area> " +
						   "<area href=\"#Cork-City\" onclick=\"javascript:setRegion('http://geo.data-gov.ie/city/cork','Cork City');return false;\" title=\"Cork City\" shape=\"poly\" id=\"CorkCityarea\" "+
						   "coords=\"212,510,202,510,202,520,212,520\"></area> " +
						   "<area  href=\"#North-Tipperary-County\" shape=\"poly\" onclick=\"javascript:setRegion('http://geo.data-gov.ie/county/north-tipperary','County North Tipperary (administrative)');return false;\" title=\"NTipperary\" id=\"NTipperaryarea\" coords=\"210,386,216,374,223,376,223,372,226,370,224,359,229,351,233,351,229,343,236,339,241,338,245,347,250,346,251,352,247,353,248,360,242,369,241,374,248,384,250,384,250,379,250,376,255,376,259,372,261,366,267,368,274,370,270,376,270,387,266,395,259,400,253,406,246,414,237,425,232,433,220,438,214,438,213,436,215,432,222,429,227,426,227,420,228,417,225,414,232,406,222,405,218,403,211,406,208,402,207,395\" ></area> "+
						   "<area href=\"#South-Tipperary-County\" shape=\"poly\" onclick=\"javascript:setRegion('http://geo.data-gov.ie/county/south-tipperary','County South Tipperary (administrative)');return false;\" title=\"STipperary\" id=\"STipperaryarea\" coords=\"272,388,275,400,282,402,285,409,286,411,291,417,288,423,291,427,289,432,292,439,298,442,297,449,291,451,283,450,280,451,274,452,267,454,265,455,265,460,264,464,267,467,265,471,258,471,256,471,247,468,244,469,237,471,232,470,231,466,232,463,232,460,232,456,233,453,228,451,225,447,225,444,220,443,219,439,232,432,239,422,250,408,263,396,266,395,270,388\"></area> "+
						   "<div class=\"notes\"><p><em>or click on your city/county, from the list, to see the service indicators in your county!<\/em><\/p><\/div>");
			*/
	}