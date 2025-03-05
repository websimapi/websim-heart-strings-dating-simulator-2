import { createApp, ref, computed, watch, onMounted } from 'vue';

const app = createApp({
    setup() {
        // State variables
        const loading = ref(true);
        const loadingMessage = ref('Loading...');
        const currentScreen = ref('character');
        const characters = ref([]);
        const locations = ref([]);
        const selectedCharacter = ref(null);
        const selectedLocation = ref(null);
        const currentDialogue = ref('');
        const responseOptions = ref([]);
        const showSettings = ref(false);
        const showConfirmation = ref(false);
        const waitingForFreeResponse = ref(false);
        const freeResponseText = ref('');
        
        // Settings with default values
        const settings = ref({
            ttsEnabled: true,
            volume: 0.8,
            rate: 1,
            showOpenResponse: true
        });

        // Computed property for open response display
        const showOpenResponse = computed(() => {
            return settings.value.showOpenResponse;
        });

        // Load saved settings from localStorage
        const loadSettings = () => {
            const savedSettings = localStorage.getItem('heartstrings_settings');
            if (savedSettings) {
                settings.value = JSON.parse(savedSettings);
            }
        };

        // Save settings to localStorage
        watch(settings, (newSettings) => {
            localStorage.setItem('heartstrings_settings', JSON.stringify(newSettings));
        }, { deep: true });

        // Initialize the app
        const initApp = async () => {
            loadSettings();
            loadingMessage.value = 'Loading characters...';
            await initializeCharacters();
            
            loadingMessage.value = 'Loading locations...';
            await initializeLocations();
            
            loading.value = false;
        };

        // Character initialization
        const initializeCharacters = async () => {
            const characterData = [
                {
                    id: 'emily',
                    name: 'Emily',
                    gender: 'female',
                    personality: 'Cheerful, artistic, loves nature',
                    interests: 'painting, hiking, indie music, photography, coffee',
                    background: 'Graphic designer with dreams of opening an art gallery',
                    imagePrompt: 'Portrait of an artistic young woman with shoulder-length brown hair, blue eyes, and a cheerful smile, graphic designer, natural makeup, casual but stylish outfit',
                    imageSeed: 1001
                },
                {
                    id: 'james',
                    name: 'James',
                    gender: 'male',
                    personality: 'Ambitious, witty, analytical',
                    interests: 'technology, rock climbing, strategy games, sci-fi novels, trying new restaurants',
                    background: 'Software engineer with his own tech startup',
                    imagePrompt: 'Portrait of an ambitious young man with short dark hair, glasses, confident smile, tech startup founder, business casual attire',
                    imageSeed: 1002
                },
                {
                    id: 'sophia',
                    name: 'Sophia',
                    gender: 'female',
                    personality: 'Confident, adventurous, passionate',
                    interests: 'traveling, dancing, cooking international cuisines, fashion, learning languages',
                    background: 'Travel journalist who has lived in five different countries',
                    imagePrompt: 'Portrait of a confident woman with long wavy black hair, warm brown eyes, adventurous expression, fashionable, travel journalist appearance',
                    imageSeed: 1003
                },
                {
                    id: 'marcus',
                    name: 'Marcus',
                    gender: 'male',
                    personality: 'Thoughtful, creative, kind',
                    interests: 'writing poetry, playing guitar, documentaries, volunteering, quiet cafes',
                    background: 'Literature professor who publishes poetry',
                    imagePrompt: 'Portrait of a thoughtful man with medium-length wavy hair, kind eyes, gentle smile, literature professor, artistic appearance, casual sophisticated style',
                    imageSeed: 1004
                },
                {
                    id: 'olivia',
                    name: 'Olivia',
                    gender: 'female',
                    personality: 'Energetic, optimistic, competitive',
                    interests: 'fitness, team sports, healthy cooking, motivational books, outdoor activities',
                    background: 'Personal trainer and former college athlete',
                    imagePrompt: 'Portrait of an athletic woman with short blonde hair, energetic smile, fit physique, sporty casual style, personal trainer appearance',
                    imageSeed: 1005
                }
            ];

            // Load character data from localStorage
            for (const char of characterData) {
                const relationship = getRelationshipData(char.id);
                characters.value.push({
                    ...char,
                    relationshipScore: relationship.score,
                    memories: relationship.memories || {}
                });
                
                // Generate character image
                generateCharacterImage(char);
            }
        };

        // Generate character image
        const generateCharacterImage = async (character) => {
            try {
                const result = await websim.imageGen({
                    prompt: character.imagePrompt,
                    seed: character.imageSeed,
                    aspect_ratio: "1:1"
                });
                
                // Find the character in the array and update its image URL
                const index = characters.value.findIndex(c => c.id === character.id);
                if (index !== -1) {
                    characters.value[index].imageUrl = result.url;
                }
            } catch (error) {
                console.error(`Error generating image for ${character.name}:`, error);
                // Retry after a delay
                setTimeout(() => generateCharacterImage(character), 3000);
            }
        };

        // Location initialization
        const initializeLocations = async () => {
            const locationData = [
                {
                    id: 'seaside-cafe',
                    name: 'Seaside Café',
                    atmosphere: 'Relaxed, romantic, peaceful',
                    description: 'A charming café with floor-to-ceiling windows offering stunning views of the ocean',
                    imagePrompt: 'A cozy seaside café with large windows overlooking the ocean, outdoor seating, peaceful atmosphere, soft lighting',
                    imageSeed: 2001
                },
                {
                    id: 'botanical-gardens',
                    name: 'Botanical Gardens',
                    atmosphere: 'Serene, beautiful, intimate',
                    description: 'Winding paths through beautiful displays of plants from around the world',
                    imagePrompt: 'Beautiful botanical garden with winding paths, exotic plants and flowers, serene atmosphere, natural light filtering through leaves',
                    imageSeed: 2002
                },
                {
                    id: 'rooftop-lounge',
                    name: 'Rooftop Lounge',
                    atmosphere: 'Sophisticated, trendy, exciting',
                    description: 'Trendy spot offering breathtaking views of the city skyline',
                    imagePrompt: 'Trendy rooftop lounge at sunset, city skyline views, comfortable seating, mood lighting, sophisticated atmosphere',
                    imageSeed: 2003
                },
                {
                    id: 'art-gallery',
                    name: 'Art Gallery',
                    atmosphere: 'Cultured, intellectual, inspiring',
                    description: 'Modern space showcasing works from local and international artists',
                    imagePrompt: 'Modern art gallery interior with paintings and sculptures, minimalist design, bright lighting, artistic atmosphere',
                    imageSeed: 2004
                },
                {
                    id: 'lakeside-park',
                    name: 'Lakeside Park',
                    atmosphere: 'Natural, peaceful, casual',
                    description: 'Picturesque park with a shimmering lake at its center',
                    imagePrompt: 'Beautiful park with a shimmering lake, walking paths, benches, trees, natural landscape, peaceful setting',
                    imageSeed: 2005
                },
                {
                    id: 'vintage-arcade',
                    name: 'Vintage Arcade',
                    atmosphere: 'Playful, nostalgic, energetic',
                    description: 'Step back in time in this nostalgic arcade filled with classic games',
                    imagePrompt: 'Nostalgic vintage arcade with classic arcade games, neon lights, retro aesthetic, energetic atmosphere',
                    imageSeed: 2006
                }
            ];

            locations.value = locationData;
            
            // Generate location images
            for (const location of locationData) {
                generateLocationImage(location);
            }
        };

        // Generate location image
        const generateLocationImage = async (location) => {
            try {
                const result = await websim.imageGen({
                    prompt: location.imagePrompt,
                    seed: location.imageSeed,
                    aspect_ratio: "16:9"
                });
                
                // Find the location in the array and update its image URL
                const index = locations.value.findIndex(l => l.id === location.id);
                if (index !== -1) {
                    locations.value[index].imageUrl = result.url;
                }
            } catch (error) {
                console.error(`Error generating image for ${location.name}:`, error);
                // Retry after a delay
                setTimeout(() => generateLocationImage(location), 3000);
            }
        };

        // Character selection
        const selectCharacter = (character) => {
            selectedCharacter.value = character;
            currentScreen.value = 'location';
        };

        // Location selection
        const selectLocation = async (location) => {
            selectedLocation.value = location;
            currentScreen.value = 'date';
            loading.value = true;
            loadingMessage.value = 'Setting up your date...';
            
            await startDate();
            
            loading.value = false;
        };

        // Start the date interaction
        const startDate = async () => {
            // Create a memory key for this character-location combination
            const memoryKey = `${selectedLocation.value.id}`;
            const character = selectedCharacter.value;
            
            // Initialize memory for this location if it doesn't exist
            if (!character.memories[memoryKey]) {
                character.memories[memoryKey] = {
                    visitCount: 0,
                    conversations: []
                };
            }
            
            // Increment visit count
            character.memories[memoryKey].visitCount++;
            
            // Get relationship stage
            const relationshipStage = getRelationshipStage(character.id);
            
            // Generate initial dialogue
            await generateDialogue(character, selectedLocation.value, relationshipStage, character.memories[memoryKey]);
        };

        // Generate dialogue based on character, location, and relationship
        const generateDialogue = async (character, location, relationshipStage, memory) => {
            const visitCount = memory.visitCount;
            const conversations = memory.conversations || [];
            
            try {
                // Create prompt for the AI
                const prompt = `You are ${character.name}, a ${character.personality} person who is interested in ${character.interests}. Your background: ${character.background}.
                
You are on a date with the player at ${location.name}, which is a ${location.atmosphere} place described as: ${location.description}.
                
This is visit #${visitCount} to this location together. Your relationship with the player is: ${relationshipStage}.

${conversations.length > 0 ? `Previous conversation snippets at this location:
${conversations.slice(-3).map(c => `You: "${c.dialogue}"
Player: "${c.response}"`).join('\n')}` : ''}

Write a natural conversational response as ${character.name} speaking to the player. This should be 1-3 sentences that reflects your personality, the relationship stage, the location atmosphere, and refer to past conversations if appropriate.

RESPOND ONLY WITH THE CHARACTER'S DIALOGUE, NO OTHER TEXT OR NARRATION.`;

                // Call the AI to generate dialogue
                const completion = await websim.chat.completions.create({
                    messages: [
                        { role: "user", content: prompt }
                    ]
                });
                
                currentDialogue.value = completion.content;
                
                // Speak the dialogue if TTS is enabled
                if (settings.value.ttsEnabled) {
                    speakDialogue(character.name, completion.content, character.gender);
                }
                
                // Generate response options
                await generateResponseOptions(character, location, relationshipStage, memory, completion.content);
                
            } catch (error) {
                console.error("Error generating dialogue:", error);
                currentDialogue.value = "Hi there! It's nice to see you. What would you like to talk about?";
                
                // Generate fallback response options
                responseOptions.value = [
                    { text: "It's great to see you too!", effect: "positive" },
                    { text: "This place is really nice.", effect: "neutral" },
                    { text: "So, tell me more about yourself.", effect: "neutral" }
                ];
            }
        };

        // Generate response options
        const generateResponseOptions = async (character, location, relationshipStage, memory, currentDialogue) => {
            try {
                // Create prompt for generating response options
                const prompt = `You are an AI assistant helping to generate response options for a dating simulator game.

Character: ${character.name}, who is ${character.personality} and interested in ${character.interests}
Location: ${location.name}, which is ${location.atmosphere}
Relationship Stage: ${relationshipStage}
Current Dialogue from character: "${currentDialogue}"

Generate 3 different response options the player could choose, each with different effects on the relationship:
1. A very positive response that would significantly improve the relationship (charming, thoughtful, or shows shared interests)
2. A positive but more neutral response
3. A slightly awkward or distanced response that might have a small negative effect

Respond with ONLY a JSON array of 3 objects, each containing 'text' (the response option) and 'effect' (very_positive, positive, neutral, or negative).`;

                // Call the AI to generate response options
                const completion = await websim.chat.completions.create({
                    messages: [
                        { role: "system", content: "Respond only with valid JSON. Output format: [{\"text\": \"player response here\", \"effect\": \"positive\"}]" },
                        { role: "user", content: prompt }
                    ],
                    json: true
                });
                
                const options = JSON.parse(completion.content);
                responseOptions.value = options.map(option => ({
                    text: option.text,
                    effect: option.effect
                }));
                
            } catch (error) {
                console.error("Error generating response options:", error);
                // Fallback options
                responseOptions.value = [
                    { text: "That sounds wonderful!", effect: "very_positive" },
                    { text: "I'm enjoying our time together.", effect: "positive" },
                    { text: "Interesting. What else is going on with you?", effect: "neutral" }
                ];
            }
        };

        // Select a response option
        const selectResponse = async (option, index) => {
            // Get current character and location
            const character = selectedCharacter.value;
            const location = selectedLocation.value;
            const memoryKey = `${location.id}`;
            
            // Update relationship score based on response effect
            let pointsChange = 0;
            switch (option.effect) {
                case 'very_positive':
                    pointsChange = 5;
                    break;
                case 'positive':
                    pointsChange = 3;
                    break;
                case 'neutral':
                    pointsChange = 1;
                    break;
                case 'negative':
                    pointsChange = -2;
                    break;
                default:
                    pointsChange = 1;
            }
            
            // Update relationship score
            character.relationshipScore += pointsChange;
            if (character.relationshipScore > 100) character.relationshipScore = 100;
            if (character.relationshipScore < 0) character.relationshipScore = 0;
            
            // Save the conversation to memory
            character.memories[memoryKey].conversations.push({
                dialogue: currentDialogue.value,
                response: option.text,
                effect: option.effect
            });
            
            // Save relationship data
            saveRelationshipData(character.id, character.relationshipScore, character.memories);
            
            // Clear response options while we wait for next dialogue
            responseOptions.value = [];
            
            // Get updated relationship stage
            const relationshipStage = getRelationshipStage(character.id);
            
            // Generate new dialogue based on the selected response
            loading.value = true;
            loadingMessage.value = 'Waiting for response...';
            
            try {
                // Create prompt for the AI
                const prompt = `You are ${character.name}, a ${character.personality} person who is interested in ${character.interests}. Your background: ${character.background}.
                
You are on a date with the player at ${location.name}, which is a ${location.atmosphere} place described as: ${location.description}.
                
Your relationship with the player is: ${relationshipStage}.

The player just said to you: "${option.text}" (This had a ${option.effect} effect on your relationship)

Write a natural conversational response as ${character.name} speaking to the player. This should be 1-3 sentences that reflects your personality, acknowledges what the player just said, and moves the conversation forward in an interesting way.

RESPOND ONLY WITH THE CHARACTER'S DIALOGUE, NO OTHER TEXT OR NARRATION.`;

                // Call the AI to generate dialogue
                const completion = await websim.chat.completions.create({
                    messages: [
                        { role: "user", content: prompt }
                    ]
                });
                
                currentDialogue.value = completion.content;
                
                // Speak the dialogue if TTS is enabled
                if (settings.value.ttsEnabled) {
                    speakDialogue(character.name, completion.content, character.gender);
                }
                
                // Generate new response options
                await generateResponseOptions(character, location, relationshipStage, character.memories[memoryKey], completion.content);
                
            } catch (error) {
                console.error("Error generating dialogue:", error);
                currentDialogue.value = "That's interesting! What else would you like to talk about?";
                
                // Generate fallback response options
                responseOptions.value = [
                    { text: "Tell me more about your interests.", effect: "positive" },
                    { text: "How do you like this place?", effect: "neutral" },
                    { text: "Should we try a different topic?", effect: "neutral" }
                ];
            }
            
            loading.value = false;
        };

        // Enable free response input
        const enableFreeResponse = () => {
            waitingForFreeResponse.value = true;
            freeResponseText.value = '';
        };

        // Cancel free response
        const cancelFreeResponse = () => {
            waitingForFreeResponse.value = false;
        };

        // Submit free response
        const submitFreeResponse = async () => {
            if (!freeResponseText.value.trim()) return;
            
            // Get current character and location
            const character = selectedCharacter.value;
            const location = selectedLocation.value;
            const memoryKey = `${location.id}`;
            
            // Create a response object for the free response
            const freeResponse = {
                text: freeResponseText.value,
                effect: 'custom' // We'll evaluate the effect using AI
            };
            
            // Clear free response input and hide it
            waitingForFreeResponse.value = false;
            
            // Clear response options while we wait for next dialogue
            responseOptions.value = [];
            
            // Get relationship stage
            const relationshipStage = getRelationshipStage(character.id);
            
            // First, evaluate the impact of the free response
            loading.value = true;
            loadingMessage.value = 'Evaluating your response...';
            
            try {
                // Create prompt to evaluate the free response
                const evaluationPrompt = `You are evaluating a player's free response in a dating simulator game.

Character: ${character.name}, who is ${character.personality} and interested in ${character.interests}
Location: ${location.name}, which is ${location.atmosphere}
Relationship Stage: ${relationshipStage}
Current Dialogue from character: "${currentDialogue.value}"
Player's Response: "${freeResponse.text}"

Rate the effect this response would have on the relationship, choosing one of:
- very_positive (charming, thoughtful, shows shared interests, perfect for the situation)
- positive (kind, engaging, appropriate)
- neutral (somewhat generic or basic)
- negative (awkward, insensitive, inappropriate, or off-putting)

Respond ONLY with a JSON object with a single 'effect' property.`;

                // Call the AI to evaluate the response
                const evaluationCompletion = await websim.chat.completions.create({
                    messages: [
                        { role: "system", content: "Respond only with valid JSON. Output format: {\"effect\": \"positive\"}" },
                        { role: "user", content: evaluationPrompt }
                    ],
                    json: true
                });
                
                const evaluation = JSON.parse(evaluationCompletion.content);
                freeResponse.effect = evaluation.effect;
                
                // Update relationship score based on evaluated effect
                let pointsChange = 0;
                switch (freeResponse.effect) {
                    case 'very_positive':
                        pointsChange = 5;
                        break;
                    case 'positive':
                        pointsChange = 3;
                        break;
                    case 'neutral':
                        pointsChange = 1;
                        break;
                    case 'negative':
                        pointsChange = -2;
                        break;
                    default:
                        pointsChange = 1;
                }
                
                // Update relationship score
                character.relationshipScore += pointsChange;
                if (character.relationshipScore > 100) character.relationshipScore = 100;
                if (character.relationshipScore < 0) character.relationshipScore = 0;
                
                // Save the conversation to memory
                character.memories[memoryKey].conversations.push({
                    dialogue: currentDialogue.value,
                    response: freeResponse.text,
                    effect: freeResponse.effect
                });
                
                // Save relationship data
                saveRelationshipData(character.id, character.relationshipScore, character.memories);
                
                // Now generate the character's response to the free response
                loadingMessage.value = 'Waiting for response...';
                
                // Create prompt for the AI
                const responsePrompt = `You are ${character.name}, a ${character.personality} person who is interested in ${character.interests}. Your background: ${character.background}.
                
You are on a date with the player at ${location.name}, which is a ${location.atmosphere} place described as: ${location.description}.
                
Your relationship with the player is: ${relationshipStage}.

The player just said to you: "${freeResponse.text}" (This had a ${freeResponse.effect} effect on your relationship)

Write a natural conversational response as ${character.name} speaking to the player. This should be 1-3 sentences that reflects your personality, acknowledges what the player just said, and moves the conversation forward in an interesting way.

RESPOND ONLY WITH THE CHARACTER'S DIALOGUE, NO OTHER TEXT OR NARRATION.`;

                // Call the AI to generate dialogue
                const completion = await websim.chat.completions.create({
                    messages: [
                        { role: "user", content: responsePrompt }
                    ]
                });
                
                currentDialogue.value = completion.content;
                
                // Speak the dialogue if TTS is enabled
                if (settings.value.ttsEnabled) {
                    speakDialogue(character.name, completion.content, character.gender);
                }
                
                // Generate new response options
                await generateResponseOptions(character, location, relationshipStage, character.memories[memoryKey], completion.content);
                
            } catch (error) {
                console.error("Error processing free response:", error);
                currentDialogue.value = "I appreciate your honesty. What else would you like to talk about?";
                
                // Update relationship slightly positively as a fallback
                character.relationshipScore += 1;
                if (character.relationshipScore > 100) character.relationshipScore = 100;
                
                // Save the conversation to memory even if there was an error
                character.memories[memoryKey].conversations.push({
                    dialogue: currentDialogue.value,
                    response: freeResponse.text,
                    effect: 'neutral'
                });
                
                // Save relationship data
                saveRelationshipData(character.id, character.relationshipScore, character.memories);
                
                // Generate fallback response options
                responseOptions.value = [
                    { text: "Tell me more about yourself.", effect: "positive" },
                    { text: "Do you come here often?", effect: "neutral" },
                    { text: "The atmosphere here is nice, isn't it?", effect: "neutral" }
                ];
            }
            
            loading.value = false;
        };

        // Text-to-speech function
        const speakDialogue = (characterName, text, gender) => {
            // Stop any currently speaking synthesis
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set voice based on gender
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                // Filter voices by gender
                const genderVoices = voices.filter(voice => {
                    if (gender === 'female') {
                        return voice.name.includes('female') || voice.name.includes('woman') || voice.name.includes('girl');
                    } else {
                        return voice.name.includes('male') || voice.name.includes('man') || voice.name.includes('boy');
                    }
                });
                
                // Use a gender-appropriate voice if available, otherwise fall back to a default
                if (genderVoices.length > 0) {
                    // Use a deterministic selection based on character name to ensure consistency
                    const nameSum = characterName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
                    utterance.voice = genderVoices[nameSum % genderVoices.length];
                }
            }
            
            // Apply user settings
            utterance.volume = settings.value.volume;
            utterance.rate = settings.value.rate;
            
            // Speak the text
            window.speechSynthesis.speak(utterance);
        };

        // Get relationship data from localStorage
        const getRelationshipData = (characterId) => {
            const savedData = localStorage.getItem(`heartstrings_relationship_${characterId}`);
            if (savedData) {
                return JSON.parse(savedData);
            }
            return { score: 0, memories: {} };
        };

        // Save relationship data to localStorage
        const saveRelationshipData = (characterId, score, memories) => {
            localStorage.setItem(`heartstrings_relationship_${characterId}`, JSON.stringify({
                score: score,
                memories: memories
            }));
        };

        // Get relationship stage based on score
        const getRelationshipStage = (characterId) => {
            const char = characters.value.find(c => c.id === characterId);
            const score = char ? char.relationshipScore : getRelationshipData(characterId).score;
            
            if (score >= 80) return 'Dating';
            if (score >= 60) return 'Close Friends';
            if (score >= 40) return 'Friends';
            if (score >= 20) return 'Acquaintances';
            return 'Strangers';
        };

        // Reset all progress
        const resetAllProgress = () => {
            for (const char of characters.value) {
                localStorage.removeItem(`heartstrings_relationship_${char.id}`);
                char.relationshipScore = 0;
                char.memories = {};
            }
            showConfirmation.value = false;
            showSettings.value = false;
        };

        // Toggle settings modal
        const toggleSettings = () => {
            showSettings.value = !showSettings.value;
        };

        // Show reset confirmation modal
        const confirmReset = () => {
            showConfirmation.value = true;
        };

        // Go back to previous screen
        const goBack = () => {
            if (currentScreen.value === 'location') {
                currentScreen.value = 'character';
                selectedCharacter.value = null;
            } else if (currentScreen.value === 'date') {
                // Stop any TTS
                window.speechSynthesis.cancel();
                
                currentScreen.value = 'location';
                selectedLocation.value = null;
                currentDialogue.value = '';
                responseOptions.value = [];
            }
        };

        // Initialize voices
        const initializeVoices = () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                // Load available voices
                window.speechSynthesis.onvoiceschanged = () => {
                    const availableVoices = window.speechSynthesis.getVoices();
                    console.log('Available voices:', availableVoices.length);
                };
                
                // Trigger voice loading
                window.speechSynthesis.getVoices();
            }
        };

        // Lifecycle hooks
        onMounted(() => {
            initializeVoices();
            initApp();
        });

        return {
            loading,
            loadingMessage,
            currentScreen,
            characters,
            locations,
            selectedCharacter,
            selectedLocation,
            currentDialogue,
            responseOptions,
            showSettings,
            showConfirmation,
            settings,
            showOpenResponse,
            waitingForFreeResponse,
            freeResponseText,
            selectCharacter,
            selectLocation,
            selectResponse,
            enableFreeResponse,
            cancelFreeResponse,
            submitFreeResponse,
            getRelationshipStage,
            toggleSettings,
            confirmReset,
            resetAllProgress,
            goBack
        };
    }
});

app.mount('#app');

