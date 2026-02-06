# Interaction Tips

> A practical guide with examples to get you started interacting with Odyssey-2 Pro.

## Let's Structure a Prompt

Consider including the below elements in your prompt. The more exhaustive your prompt, the clearer the picture Odyssey-2 Pro will be able to reference.

| Element | Description | Examples |
|---------|-------------|----------|
| **Subject** | Objects, animals, people, or sceneries to be included | cityscape, desert, boats, puppies, 3 friends |
| **Action** | What the subject(s) are doing | walking, running, talking, painting, sitting |
| **Environment** | The background, setting or time of day | sunset, rainy street, cozy cafe |
| **Style** | Art styles, artists, mediums, aesthetics, film styles | horror, film noir, cartoon, watercolor |
| **Camera position** | Where the camera is | top-down, aerial, eye-level, worm's-eye |
| **Composition** | How the shot is framed | wide shot, close-up, single-shot, two-shot |
| **Focus/lens** | Visual effects | shallow focus, deep focus, soft focus, macro lens, wide-angle |
| **Ambiance/mood/lighting** | Lighting and color | soft light, harsh, neon, sunset, dark, ominous, blue tones, warm tones |

### Example Prompt
> Two Italian brothers dressed in steampunk, sitting in a booth at a harshly lit, futuristic, cyberpunk coffee cafe.

---

## Adding Styles & Visual Aesthetics

Odyssey-2 Pro understands a wide range of colloquial stylistic descriptions, even when they aren't formal art terms. You can reference your favorite artist, a well-known art movement, or even cultural shorthand like "Minecraft style," "1960s cartoon," or "GTA 6 graphics."

These light-touch style cues are often enough for Odyssey-2 Pro to infer the entire aesthetic: color palettes, brushwork, rendering modes, lighting, and even cultural conventions.

### Art Movements

| Style | Description |
|-------|-------------|
| **Pop art** | Bright colors, bold outlines, graphic/comic vibes. Great for stylized, attention-grabbing scenes |
| **Surrealism** | Dreamlike, bizarre, subconscious imagery that feels symbolic or dream-logic driven |
| **Cubism** | Fragmented geometry, multiple viewpoints at once. Angular shapes and abstract composition |
| **Graffiti/Street art** | Sprayed textures, bold stencils, urban flair. Ideal for edgy or contemporary aesthetics |
| **Minimalism** | Clean shapes, limited palette, visual simplicity. Useful for clarity and negative space |
| **Renaissance** | Classical realism, dramatic lighting, idealized forms. Period-accurate rendering |
| **Expressionism** | Emotion-driven distortion and heavy brushstrokes. Intensity and exaggeration |

### Cultural/Genre Styles

Odyssey-2 Pro is flexible with colloquial or genre-based styles:

- Photorealistic
- 8-bit pixel art
- Minecraft voxel style
- Japanese anime
- 1960s cartoon
- 2010s cartoon
- GTA-6 realism

---

## Mixing Multiple Styles & Visual Concepts

Odyssey-2 Pro can faithfully blend multiple styles and concepts into one creation—often with one simple stylistic direction.

### Example Base Prompt
> A man and his dog walking through an alley way towards the camera in soft focus, in the style...

- **dark fantasy** - Affects setting, clothes, color palette, and the dog itself
- **film noir** - Different atmosphere, lighting, and visual treatment

Try prompting a fusion of your favorite representations!

---

## Framing Your Subject

Odyssey-2 Pro understands common cinematography terms for subject distance and framing:

| Term | Description |
|------|-------------|
| **Macro shot** | Extreme detail of tiny subjects |
| **Extreme close-up (ECU)** | Detailed level |
| **Close-up (CU)** | Head fills frame |
| **Medium close-up (MCU)** | Chest-up |
| **Over-the-shoulder (OTS)** | Positioned behind one subject, looking over their shoulder toward another subject |

---

## Adjusting the Camera's Position

For storytelling or blocking, you can specify where the camera physically sits:

| Position | Description |
|----------|-------------|
| **Bird's-eye view** | Overhead, looking down upon subject |
| **Profile shot** | Side view of subject |
| **Back/behind shot** | Rear view of subject |

---

## Using Negative Prompts

Prompting Odyssey-2 Pro what you **don't** want can help constrain and exclude attributes from generation.

| Prompt | Result |
|--------|--------|
| Animation of a large, solitary oak tree with leaves blowing vigorously in a strong wind. | Standing Strong in the Storm |
| Animation of a large, solitary oak tree with leaves blowing vigorously in a strong wind. **Negative prompt:** dark, stormy, or threatening atmosphere | Gentle Wind, Silent Oak |

---

## Tips for Prompting Midstream

**Important:** Dynamic present-tense action verbs can cause actions to loop, while stative present-continuous descriptions describe a completed, ongoing state.

| Phrasing | Type | Result |
|----------|------|--------|
| "puts on glasses" | Action (verbs) | **Loops** - interpreted as an ongoing event that repeats |
| "is wearing glasses" | State description | **No loops** - interpreted as a one-time, stable result |

### Rule of Thumb
- **Action verbs** (puts on, picks up, starts) → May loop
- **State descriptions** (is wearing, is holding, has) → Stable state

---

## Known Limitations

Known non-real subjects and actions limit Odyssey-2 Pro's ability to adhere to stylistic requests and realism. The model will often seek to accurately represent your subject/action, at the expense of your stylistic requests.

### Example: Silhouette Accuracy

| Prompt | Observation |
|--------|-------------|
| Silhouette of **a man** standing in front of a bright setting sun... | Clean silhouette |
| Silhouette of **an Italian plumber** standing in front of a bright setting sun... | Less clean silhouette |
| Silhouette of **Mario** standing in front of a bright setting sun... | Silhouette suffers, model prioritizes character accuracy |

**Takeaway:** As subjects become more specific or fictional, the model prioritizes accurate representation over stylistic requests.

---

## Quick Reference Card

### Best Practices
1. ✅ Be specific with subjects, actions, and environments
2. ✅ Include style cues (art movements, film styles, aesthetics)
3. ✅ Specify camera position and composition
4. ✅ Use negative prompts to exclude unwanted elements
5. ✅ Use state descriptions for midstream interactions ("is wearing" vs "puts on")

### Common Pitfalls
1. ❌ Action verbs in midstream prompts (causes looping)
2. ❌ Highly specific fictional characters with strict style requirements
3. ❌ Vague prompts without style/composition guidance
