import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '../../app/apiService';
import { POKEMONS_PER_PAGE } from '../../app/config';

export const getPokemons = createAsyncThunk('pokemons/getPokemons', async ({ page, search, type }, { rejectWithValue }) => {
    try {
        console.log('Getting pokemons with params:', { page, search, type });
        
        let url;
        
        // Nếu có type, sử dụng endpoint lọc theo type
        if (type) {
            url = `/pokemons/type/${type}`;
            console.log('Using type endpoint:', url);
        }
        // Nếu có search, sử dụng endpoint tìm kiếm theo tên
        else if (search) {
            url = `/pokemons/search?name=${search}`;
            console.log('Using search endpoint:', url);
        }
        // Mặc định: lấy tất cả Pokémon với phân trang
        else {
            url = `/pokemons?page=${page}&limit=${POKEMONS_PER_PAGE}`;
            console.log('Using default endpoint:', url);
        }
        
        // Gọi API
        console.log('Calling API at:', url);
        const response = await apiService.get(url);
        console.log('Raw API response:', response);
        
        // Thêm delay để UI hiển thị loading state
        const timeout = () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve('ok');
                }, 500); // Giảm thời gian chờ để UX tốt hơn
            });
        };
        await timeout();
        
        // Xử lý các loại response khác nhau
        let result = [];
        
        // Nếu response là object với thuộc tính data (endpoint /pokemons)
        if (response && typeof response === 'object' && response.data) {
            result = response.data;
        }
        // Nếu response là mảng trực tiếp (endpoint /search và /type/:type)
        else if (Array.isArray(response)) {
            result = response;
        }
        
        console.log('Processed API Result:', result);
        return result || [];
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const getPokemonById = createAsyncThunk('pokemons/getPokemonById', async (id, { rejectWithValue }) => {
    try {
        let url = `/pokemons/${id}`;
        const response = await apiService.get(url);
        if (!response.data) return rejectWithValue({ message: 'No data' });
        return response.data;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const addPokemon = createAsyncThunk(
    'pokemons/addPokemon',
    async ({ name, id, imgUrl, types }, { rejectWithValue }) => {
        try {
            let url = '/pokemons';
            await apiService.post(url, { name, id, url: imgUrl, types });
            return
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)

export const editPokemon = createAsyncThunk('pokemons/editPokemon', async ({ name, id, url, types }, { rejectWithValue }) => {
    try {
        let url = `/pokemons/${id}`;
        await apiService.put(url, { name, url, types });
        return;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const deletePokemon = createAsyncThunk('pokemons/deletePokemon', async ({ id }, { rejectWithValue, dispatch }) => {
    try {
        let url = `/pokemons/${id}`;
        await apiService.delete(url);
        dispatch(getPokemonById());
        return;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const pokemonSlice = createSlice({
    name: 'pokemons',
    initialState: {
        isLoading: false,
        pokemons: [],
        pokemon: {
            pokemon: null,
            nextPokemon: null,
            previousPokemon: null,
        },
        search: '',
        type: '',
        page: 1,
    },
    reducers: {
        changePage: (state, action) => {
            if (action.payload) {
                state.page = action.payload;
            } else {
                state.page++;
            }
        },
        typeQuery: (state, action) => {
            state.type = action.payload;
        },
        searchQuery: (state, action) => {
            state.search = action.payload;
        },
    },
    extraReducers: {
        [getPokemons.pending]: (state, action) => {
            state.loading = true;
            state.errorMessage = '';
            
            // Nếu đang tìm kiếm hoặc lọc theo type và là trang đầu tiên, reset danh sách pokemons
            if ((state.search || state.type) && state.page === 1) {
                state.pokemons = [];
            }
        },
        [getPokemonById.pending]: (state) => {
            state.loading = true;
            state.errorMessage = '';
        },

        [addPokemon.pending]: (state) => {
            state.loading = true;
            state.errorMessage = '';
        },
        [deletePokemon.pending]: (state) => {
            state.loading = true;
            state.errorMessage = '';
        },
        [editPokemon.pending]: (state) => {
            state.loading = true;
            state.errorMessage = '';
        },
        [getPokemons.fulfilled]: (state, action) => {
            state.loading = false;
            const { search, type } = state;
            if ((search || type) && state.page === 1) {
                state.pokemons = action.payload;
            } else {
                state.pokemons = [...state.pokemons, ...action.payload];
            }
        },
        [getPokemonById.fulfilled]: (state, action) => {
            state.loading = false;
            state.pokemon = action.payload;
        },
        [addPokemon.fulfilled]: (state) => {
            state.loading = false;
        },
        [deletePokemon.fulfilled]: (state) => {
            state.loading = false;
        },
        [editPokemon.fulfilled]: (state) => {
            state.loading = true;
        },
        [getPokemons.rejected]: (state, action) => {
            state.loading = false;
            if (action.payload) {
                state.errorMessage = action.payload.message;
            } else {
                state.errorMessage = action.error.message;
            }
        },
        [getPokemonById.rejected]: (state, action) => {
            state.loading = false;
            if (action.payload) {
                state.errorMessage = action.payload.message;
            } else {
                state.errorMessage = action.error.message;
            }
        },

        [addPokemon.rejected]: (state, action) => {
            state.loading = false;
            if (action.payload) {
                state.errorMessage = action.payload.message;
            } else {
                state.errorMessage = action.error.message;
            }
        },
        [deletePokemon.rejected]: (state, action) => {
            state.loading = false;
            if (action.payload) {
                state.errorMessage = action.payload.message;
            } else {
                state.errorMessage = action.error.message;
            }
        },
        [editPokemon.rejected]: (state, action) => {
            state.loading = false;
            if (action.payload) {
                state.errorMessage = action.payload.message;
            } else {
                state.errorMessage = action.error.message;
            }
        },
    },
});

const { actions, reducer } = pokemonSlice;
export const { changePage, searchQuery, typeQuery } = actions;
export default reducer;
