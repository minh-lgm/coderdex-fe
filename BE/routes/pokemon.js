const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const loadPokemonData = () => {
  try {
    const dataPath = path.join(__dirname, '../data', 'pokemon.json');
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error loading Pokemon data:', error);
    return [];
  }
};

/**
 * @route GET /pokemons
 * @description Get all pokemons with pagination
 */
router.get('/', (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const pokemons = loadPokemonData() || [];
    
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedPokemons = pokemons.slice(startIndex, endIndex);
    
    const formattedPokemons = paginatedPokemons.map(pokemon => ({
      id: pokemon.id,
      name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
      types: pokemon.types,
      url: `/images/${pokemon.name.toLowerCase()}.png`
    }));
    
    res.status(200).json({
      data: formattedPokemons
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /pokemons/search
 * @description Search pokemons by name
 */
router.get('/search', (req, res, next) => {
  try {
    const { name, search } = req.query;
    const searchTerm = (name || search || "").toLowerCase();
    
    if (!searchTerm) {
      return res.status(400).json([]);
    }
    
    const pokemons = loadPokemonData() || [];
    
    const filteredPokemons = pokemons.filter(pokemon => 
      pokemon.name.toLowerCase().includes(searchTerm)
    );
    
    const formattedPokemons = filteredPokemons.map(pokemon => ({
      id: pokemon.id,
      name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
      types: pokemon.types,
      url: `/images/${pokemon.name.toLowerCase()}.png`
    }));
    
    res.status(200).json(formattedPokemons);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /pokemons/type/:type
 * @description Search pokemons by type
 */
router.get('/type/:type', (req, res, next) => {
  try {
    const { type } = req.params;
    
    if (!type) {
      return res.status(400).json([]);
    }
    
    const pokemons = loadPokemonData() || [];
    
    const filteredPokemons = pokemons.filter(pokemon => 
      pokemon.types.some(t => t.toLowerCase() === type.toLowerCase())
    );
    
    const formattedPokemons = filteredPokemons.map(pokemon => ({
      id: pokemon.id,
      name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
      types: pokemon.types,
      url: `/images/${pokemon.name.toLowerCase()}.png`
    }));
    
    res.status(200).json(formattedPokemons);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /pokemons/:id
 * @description Get a single pokemon by id
 */
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const pokemons = loadPokemonData() || [];
    
    const pokemon = pokemons.find(p => p.id === parseInt(id));
    
    if (!pokemon) {
      return res.status(404).json({ message: `Pokemon with id ${id} not found` });
    }
    
    const currentIndex = pokemons.findIndex(p => p.id === parseInt(id));
    
    const nextIndex = currentIndex < pokemons.length - 1 ? currentIndex + 1 : 0;
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : pokemons.length - 1;
    
    const nextPokemonRaw = pokemons[nextIndex];
    const previousPokemonRaw = pokemons[previousIndex];
    
    const formatPokemon = (p) => {
      if (!p) return null;
      return {
        id: p.id,
        name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
        types: p.types,
        url: `/images/${p.name.toLowerCase()}.png`
      };
    };
    
    const formattedPokemon = formatPokemon(pokemon);
    const nextPokemon = formatPokemon(nextPokemonRaw);
    const previousPokemon = formatPokemon(previousPokemonRaw);
    
    res.status(200).json({
      data: {
        pokemon: formattedPokemon,
        nextPokemon,
        previousPokemon
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /pokemons
 * @description Create a new Pokemon
 * @access Public
 */
router.post('/', (req, res, next) => {
  try {
    const { name, id, types, url } = req.body;
    const pokemons = loadPokemonData() || [];
    
    // Define valid Pokemon types
    const pokemonTypes = [
      "bug", "dragon", "fairy", "fire", "ghost", 
      "ground", "normal", "psychic", "steel", "dark", 
      "electric", "fighting", "flying", "grass", "ice", 
      "poison", "rock", "water"
    ];
    
    // Check for missing required data
    if (!name || !id || !types || !url) {
      return res.status(400).json({ message: "Missing required data." });
    }
    
    // Validate types length (1 or 2 only)
    if (!Array.isArray(types) || types.length === 0 || types.length > 2) {
      return res.status(400).json({ message: "Pokémon can only have one or two types." });
    }
    
    // Validate types against valid types array
    const invalidTypes = types.filter(type => !pokemonTypes.includes(type.toLowerCase()));
    if (invalidTypes.length > 0) {
      return res.status(400).json({ message: "Pokémon's type is invalid." });
    }
    
    // Check if Pokemon already exists by id or name
    const pokemonExists = pokemons.some(
      pokemon => pokemon.id === parseInt(id) || pokemon.name.toLowerCase() === name.toLowerCase()
    );
    
    if (pokemonExists) {
      return res.status(400).json({ message: "The Pokémon already exists." });
    }
    
    // Create new Pokemon
    const newPokemon = {
      id: parseInt(id),
      name: name.toLowerCase(),
      types: types.map(type => type.toLowerCase()),
      url: url
    };
    
    // Add Pokemon to data array
    pokemons.push(newPokemon);
    
    // Save updated data back to file
    const dataPath = path.join(__dirname, '../data/pokemon.json');
    fs.writeFileSync(dataPath, JSON.stringify(pokemons), 'utf8');
    
    // Return the newly created Pokemon
    res.status(201).json({
      id: newPokemon.id,
      name: newPokemon.name.charAt(0).toUpperCase() + newPokemon.name.slice(1),
      types: newPokemon.types,
      url: newPokemon.url
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
