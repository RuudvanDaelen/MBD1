/**
 * Created by Ruud on 3-2-2016.
 */

function alertSearch() {
    var searchValue = document.getElementById("search-basic").value;
    if(searchValue != "") {
    	alert(searchValue);
    	//Ajax call naar api om pokemons op te halen    
    }
}

function createPokemonList() {


	$.getJSON('http://pokeapi.co/api/v2/pokemon/', function(data) {
	    //data is the JSON string
	    //alert(data);


	    for(var pokemonId in data) {
	    	var pokemonObj = data[pokemonId];
	    	
	    	alert(pokemonObj.name + " : " + pokemonObj.url);
	    }
	});


	
}

/*

for (var i = 0; i <= 10; i++) {
	    	html = "";

			html += "<li>";
		    html += "<a href='#'>";
		    html += "<img src='chrome.png'>";
		    html += "<h2>Pokemon naam</h2>";
		    html += "<p>#nummer</p>";
		    html += "</a>";
		    html += "</li>";

		    $("#pokemon-list").append(html);



*/