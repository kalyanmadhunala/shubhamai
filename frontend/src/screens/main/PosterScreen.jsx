// src/screens/main/PosterScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Clipboard,
  Linking,
  Share,
  Animated,
  Alert,
  useWindowDimensions,
  Image,
} from 'react-native';
import {
  Trash2,
  Import,
  Plus,
  CircleX,
  CircleCheck,
  ChevronDown,
  ChevronUp,
  Building2,
  Astroid,
  CircleUserRound,
  MapPin,
  Copy,
  Share2,
  Phone,
  Languages,
  Paperclip,
} from 'lucide-react-native';

import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import BackButton from '../../components/common/BackButton';
import { PROFILE_KEY } from './HomeScreen';
import { toast, Toaster } from 'sonner-native';

// ─────────────────────────────────────────────────────────────
// Prompt Builder
// ─────────────────────────────────────────────────────────────

function buildEventPrompt({ event, profile, promptOptions }) {
  const businessName = profile?.businessName || 'Shri Manjunatha Businesses';
  const wisherName = profile?.fullName || 'Madhunala';
  const businessAddress = profile?.businessAddress || 'Karimnagar';
  const phoneNumber = profile?.phone || '9440159683';
  const eventName = event?.name || 'Event';
  const description = event?.description || '';
  const promptHint = event?.promptHint || '';
  const category = event?.category || '';
  const emoji = event?.emoji || '🎉';

  return `Create a PREMIUM HIGH-QUALITY SOCIAL MEDIA POSTER for "${eventName}" ${emoji}.

━━━━━━━━━━━━━━━━━━
🎨 DESIGN DIRECTION
━━━━━━━━━━━━━━━━━━

The poster must look professionally designed by an expert Indian social media poster designer.

Design quality must be:
- Premium and professional
- Visually attractive
- Emotionally engaging
- Social-media-ready
- Modern and stylish
- Clean and balanced
- High-quality designer finish

IMPORTANT:
The overall design intensity should adapt according to the event.

Examples:
- Spiritual/Festival events → rich festive premium style
- National events → elegant patriotic style
- Birthday wishes → vibrant modern celebratory style
- Anniversary wishes → romantic luxury style
- Congratulations → modern stylish premium style
- Professional events → clean minimal premium style
- Emotional occasions → soft cinematic emotional style

The poster should NEVER feel:
- overly decorative
- too empty
- too flashy
- too cluttered
- too minimal
- too traditional
- too modern

Maintain a balanced premium designer aesthetic according to the event mood.

━━━━━━━━━━━━━━━━━━
🎯 EVENT DETAILS
━━━━━━━━━━━━━━━━━━

Event:
${eventName}

Description:
${description}

Category:
${category}

${promptHint ? `Special Visual Theme: ${promptHint}` : ''}

━━━━━━━━━━━━━━━━━━
🖼️ BACKGROUND & VISUALS
━━━━━━━━━━━━━━━━━━

Generate visuals dynamically according to the event theme.

The poster must intelligently include relevant visuals according to the event.

Possible visual elements:
- Event-related cultural visuals
- Traditional Indian aesthetics
- Decorative ornaments if suitable
- Flowers if suitable
- Rangoli patterns if suitable
- Temple art if suitable
- Festive lights if suitable
- Diyas if suitable
- Patriotic elements if suitable
- Celebration particles
- Floating petals
- Soft glow effects
- Modern textures
- Elegant gradients
- Decorative borders if suitable
- Premium background textures
- Minimal clean compositions when suitable

If the event is regional or cultural:
- Include relevant monuments
- Cultural symbols
- Event-specific imagery
- Spiritual decorative elements

Use visual styling only when appropriate for the event:
- elegant gradients
- cinematic lighting
- modern premium textures
- decorative elements if suitable
- floral accents if suitable
- luxury framing if suitable
- minimal clean composition if suitable
- premium layered depth
- stylish modern aesthetics
- emotional visual storytelling

The design should intelligently balance:
luxury + minimal + modern + festive
according to the event naturally.

━━━━━━━━━━━━━━━━━━
🌈 BACKGROUND MOOD
━━━━━━━━━━━━━━━━━━

Background mood should adapt according to the event:
- festive when needed
- elegant when needed
- emotional when needed
- minimal when needed
- modern when needed
- luxurious when needed

Always maintain:
- premium quality
- balanced composition
- clean visual hierarchy
- professional social media aesthetics

━━━━━━━━━━━━━━━━━━
📝 TYPOGRAPHY & TEXT RULES
━━━━━━━━━━━━━━━━━━

Main headline must be:
- Very large
- Bold
- Crystal clear
- Beautifully styled
- Professionally aligned
- Center-focused
- Highly readable on mobile

Typography should dynamically match the event mood.

Examples:
- Festival → decorative premium typography
- Birthday → vibrant stylish typography
- Anniversary → elegant romantic typography
- Congratulations → bold modern typography
- Professional events → minimal clean typography

Typography should feel:
- Premium
- Balanced
- Modern
- Stylish
- Elegant
- Mobile readable

${
  promptOptions?.isTelugu
    ? `
IMPORTANT TELUGU TEXT RULES:
- ALL TEXT MUST BE IN PERFECT TELUGU
- Use only Telugu language
- No English text
- Telugu spelling must be 100% accurate
- Telugu letters must be crystal clear
- No broken Telugu glyphs
- No AI spelling mistakes
- Use natural Telugu wording
- Use premium Telugu typography
- Telugu font must look elegant and professional
- Text must be perfectly readable on mobile
- Maintain proper Telugu grammar and spacing
`
    : `
IMPORTANT ENGLISH TEXT RULES:
- Use premium English typography
- Professional wording
- Elegant readable font styling
- Stylish modern text layout
`
}

━━━━━━━━━━━━━━━━━━
💬 WISHES MESSAGE
━━━━━━━━━━━━━━━━━━

Generate a warm wishes message related to the event.

The wishes text should:
- Feel emotional
- Feel natural
- Match Indian culture
- Be concise and elegant
- Blend naturally into the layout
- Feel premium and human-like

━━━━━━━━━━━━━━━━━━
📐 POSTER LAYOUT
━━━━━━━━━━━━━━━━━━

Use a professional balanced layout:

1. Decorative or minimal top section according to the event
2. Event-related visuals
3. Main headline in center
4. Wishes message
5. Elegant decorative dividers if suitable
6. Premium bottom business panel

Use according to the event:
- elegant spacing
- symmetrical composition
- modern clean composition
- luxury ornamental design if suitable
- floral decorations if suitable
- premium framing if suitable
- cinematic depth
- premium layered composition

Maintain:
- visual balance
- clean spacing
- professional hierarchy
- social-media-friendly readability

━━━━━━━━━━━━━━━━━━
🖼️ ATTACHED IMAGE HANDLING
━━━━━━━━━━━━━━━━━━

${
  promptOptions?.attachImage
    ? `
IMAGE MODE: ENABLED

The uploaded image represents:
- business owner
- sponsor
- organization representative
- wisher
- branding identity

IMPORTANT:
The uploaded person should appear as a PREMIUM SUPPORTING BRANDING ELEMENT.

The event/festival/occasion itself must remain the MAIN VISUAL FOCUS.

STRICT RULES:
- Use ONLY uploaded image(s) for portrait-style faces
- Do NOT generate fake business-owner portraits
- Do NOT replace uploaded faces
- Preserve real identity accurately
- Maintain realistic skin tone and facial structure
- Keep uploaded faces natural, sharp, and recognizable

PORTRAIT BEHAVIOR:
- The uploaded portrait should usually remain small-to-medium sized
- Position naturally near the business/footer area
- Typically place near bottom-left business details section
- Never overpower the event visuals
- Never dominate the composition
- Never block important text

IMPORTANT EVENT LOGIC:
Contextual humans related naturally to the event are allowed when visually suitable.

Examples:
- women for Women's Day
- devotees for spiritual festivals
- cultural dancers for traditional events
- patriotic crowd silhouettes for national events
- celebration atmosphere people
- family silhouettes for family-oriented occasions

However:
- contextual humans must remain secondary visuals
- uploaded person remains the ONLY portrait-style branding face
- avoid additional random foreground faces
- avoid unrelated close-up humans
- avoid fake sponsor portraits

VISUAL PRIORITY ORDER:
1. Event/Festival identity
2. Typography & celebration visuals
3. Cultural/event atmosphere
4. Uploaded owner/wisher portrait

PORTRAIT STYLE:
- Professional
- Elegant
- Premium
- Clean social-media branding style

The final poster should feel like a professionally designed premium event greeting poster with elegant owner branding integration.`
    : `
IMAGE MODE: DISABLED

Do NOT generate:
- random business-owner portraits
- fake sponsor faces
- unrelated foreground portraits
- AI-generated hero subjects
- random close-up people
- fake uploaded-person replacements

IMPORTANT:
Humans may appear ONLY if naturally suitable and contextually related to the specific event or festival.

Examples:
- Women for Women's Day
- Mothers for Mother's Day
- Children for Children's Day
- Teachers for Teachers Day
- Devotees for spiritual festivals
- Cultural dancers for traditional festivals
- Patriotic crowd silhouettes for national events
- Celebration atmosphere people when contextually appropriate
- Traditional festival participants
- Religious gathering atmosphere
- Yoga participants for Yoga Day
- Family silhouettes for family-oriented occasions

STRICT RULES:
- Event-related people must remain secondary supporting visuals
- Avoid random portrait-focused compositions
- Avoid unrelated foreground faces
- Avoid AI-style business-owner portraits
- Avoid dominant unknown human subjects
- The event/festival itself must remain the MAIN visual focus

Focus primarily on:
- event identity
- festival visuals
- typography
- decorations
- cultural elements
- symbolic visuals
- cinematic lighting
- premium social-media composition

The final poster should feel naturally related to the event while avoiding random unrelated portrait generation.`
}

━━━━━━━━━━━━━━━━━━
🏢 BUSINESS BRANDING SECTION
━━━━━━━━━━━━━━━━━━

${
  promptOptions?.businessName
    ? `
Include a PREMIUM BUSINESS DETAILS PANEL at the bottom.

Business Name:
${businessName}

The business name should:
- Be prominent
- Be elegant
- Be beautifully styled
- Match poster colors
- Look premium and professional
`
    : ''
}

${
  promptOptions?.wisherName
    ? `
Wisher Name:
${wisherName}

Display the wisher name elegantly ${
        promptOptions?.businessName ? 'below the business name' : 'at bottom'
      }.
`
    : ''
}
${
  promptOptions?.businessAddress
    ? `
Business Address:
${businessAddress}

Address placement rules:
- Place only in bottom business panel
- Smaller than business name
- Perfectly aligned
- Elegant readable typography
- Professional spacing
- Stylish divider decorations if suitable
`
    : ''
}
${
  promptOptions?.phoneNumber
    ? `
Phone Number:
${phoneNumber}

Phone number placement rules:
- Place near address section
- Stylish and readable
- Small premium typography
- Balanced alignment
`
    : ''
}

━━━━━━━━━━━━━━━━━━
🌟 VISUAL QUALITY
━━━━━━━━━━━━━━━━━━

Poster quality must be:
- Ultra HD
- Premium quality
- Print-quality finish
- Social-media ready
- Extremely sharp
- Richly detailed
- Mobile optimized

Use:
- Realistic lighting
- Smooth gradients
- Professional shadows
- Decorative depth
- Premium texture detailing
- Cinematic glow effects

━━━━━━━━━━━━━━━━━━
🚫 NEGATIVE RULES
━━━━━━━━━━━━━━━━━━

DO NOT:
- Add logos
- Add watermarks
- Use blurry text
- Use broken Telugu letters
- Create spelling mistakes
- Use low-quality graphics
- Use cluttered layouts
- Use unrelated visuals
- Leave empty spaces
- Distort typography
- Create cropped text
- Overdecorate minimal events
- Oversimplify festive events

━━━━━━━━━━━━━━━━━━
📱 FINAL OUTPUT
━━━━━━━━━━━━━━━━━━

- Aspect Ratio: 3:4
- Perfect for WhatsApp status
- Perfect for Instagram posts
- Premium Indian social media poster
- Beautiful designer-quality composition
- Crystal-clear typography
- Highly share-worthy visual quality

The poster should intelligently choose between:
- luxurious
- minimal
- modern
- cool
- elegant
- emotional
- festive

according to the event mood and occasion.

Generate a MASTERPIECE-LEVEL EVENT POSTER with premium balanced Indian social media aesthetics.

`;
}

function buildCustomPrompt({ customParams, profile, promptOptions }) {
  const {
    personName,
    description,
    businessName: bName,
    wisherName: wName,
  } = customParams;

  const businessName = bName || profile?.businessName || 'Our Business';

  const wisherName = wName || profile?.fullName || 'Our Team';

  const businessAddress = profile?.businessAddress || 'Karimnagar';

  const phoneNumber = profile?.phone || '9440159683';

  return `

Create a PREMIUM HIGH-QUALITY CUSTOM SOCIAL MEDIA POSTER for "${description}".

━━━━━━━━━━━━━━━━━━
🎨 DESIGN DIRECTION
━━━━━━━━━━━━━━━━━━

The poster must look professionally designed by an expert Indian social media poster designer.

IMPORTANT:
The entire design style should automatically adapt according to the occasion.

Examples:
- Birthday → vibrant, modern, fun, colorful
- Wedding Anniversary → elegant, romantic, luxury
- Congratulations → stylish, achievement-focused, premium
- Best Wishes → minimal, emotional, clean
- Emotional wishes → soft cinematic mood
- Professional wishes → modern clean layout

The design should intelligently choose:
- luxury OR minimal
- decorative OR clean
- modern OR traditional
- vibrant OR elegant
according to the occasion naturally.

━━━━━━━━━━━━━━━━━━
🎯 OCCASION DETAILS
━━━━━━━━━━━━━━━━━━

Person Name:
${personName}

Occasion:
${description}

━━━━━━━━━━━━━━━━━━
🖼️ VISUAL STYLE & BACKGROUND
━━━━━━━━━━━━━━━━━━

Generate visuals dynamically according to the occasion.

Use only relevant visual elements.

Possible elements (only if suitable):
- Flowers
- Balloons
- Celebration particles
- Confetti
- Sparkles
- Floral borders
- Luxury ornaments
- Soft gradients
- Decorative lighting
- Romantic effects
- Elegant textures
- Modern clean backgrounds
- Emotional cinematic lighting

The background should feel:
- Premium
- Professional
- Emotional
- Social-media-ready
- Beautifully balanced

Avoid overdesigning minimal occasions.

━━━━━━━━━━━━━━━━━━
👤 PERSON FOCUS
━━━━━━━━━━━━━━━━━━

"${personName}" should be beautifully highlighted.

The name should:
- Stand out clearly
- Be stylishly designed
- Feel premium
- Match the occasion mood
- Be mobile-readable
- Be visually attractive

━━━━━━━━━━━━━━━━━━
📝 TYPOGRAPHY RULES
━━━━━━━━━━━━━━━━━━

Typography should dynamically match the occasion.

Examples:
- Birthday → playful premium typography
- Anniversary → elegant romantic typography
- Congratulations → bold modern typography
- Best Wishes → soft minimal typography

Text must:
- Be crystal clear
- Be readable on mobile
- Have proper spacing
- Look professionally aligned
- Feel visually premium

${
  promptOptions?.isTelugu
    ? `
IMPORTANT TELUGU TEXT RULES:
- ALL TEXT MUST BE IN PERFECT TELUGU
- Use only Telugu language
- No English text
- Telugu spelling must be 100% accurate
- Telugu letters must be crystal clear
- No broken Telugu glyphs
- No AI text mistakes
- Use elegant Telugu typography
- Use natural Telugu wording
- Text must look premium and readable
- All Telugu words should render perfectly
`
    : `
IMPORTANT ENGLISH TEXT RULES:
- Use premium English typography
- Elegant readable font styling
- Professional wording
- Stylish modern text layout
`
}

━━━━━━━━━━━━━━━━━━
💬 WISHES MESSAGE
━━━━━━━━━━━━━━━━━━

Generate a warm wishes message related to the occasion.

The wishes message should feel:
- Emotional
- Genuine
- Premium
- Elegant
- Human-like
- Social-media-friendly

Keep it concise and beautiful.

━━━━━━━━━━━━━━━━━━
📐 POSTER LAYOUT
━━━━━━━━━━━━━━━━━━

Use a professional balanced layout:

1. Premium decorative top section
2. Occasion-related visual composition
3. Main headline / wishes text
4. Highlighted person name
5. Elegant decorative dividers
6. Premium bottom business section

Use according to the occasion:
- minimal design
- luxury design
- elegant spacing
- decorative framing
- modern clean composition
- cinematic depth
- premium layering

━━━━━━━━━━━━━━━━━━
🖼️ ATTACHED IMAGE HANDLING
━━━━━━━━━━━━━━━━━━

${
  promptOptions?.attachImage
    ? `
IMAGE MODE: ENABLED

The uploaded image(s) represent the MAIN OCCASION PERSON(S).

IMPORTANT:
The uploaded person(s) MUST become the MAIN SUBJECT of the poster.

The entire poster composition should revolve around:
- the uploaded person
- the custom occasion
- the emotional celebration mood

STRICT RULES:
- Use ONLY uploaded image(s) for portrait-style faces
- Do NOT generate random people
- Do NOT replace uploaded faces
- Do NOT add unknown humans
- Preserve real identity accurately
- Maintain realistic skin tone and facial structure
- Keep faces natural, sharp, and recognizable
- Avoid AI-looking faces
- Avoid distorted facial features

CUSTOM OCCASION BEHAVIOR:

Birthday:
- vibrant stylish hero portrait
- celebratory atmosphere
- modern luxury birthday aesthetics
- premium cinematic lighting

Anniversary:
- elegant romantic composition
- emotional couple framing
- warm premium tones
- classy decorative styling

Congratulations:
- achievement-focused premium portrait
- success-oriented visuals
- modern professional celebration mood

Farewell:
- emotional cinematic portrait mood
- warm memorable atmosphere
- elegant soft-light composition

Best Wishes:
- friendly emotional portrait composition
- warm modern celebration aesthetics

Festival Wishes:
- festive portrait integration
- cultural decorative atmosphere
- premium celebratory composition

Baby/Family Events:
- soft emotional family-focused composition
- warm premium styling
- elegant emotional balance

PORTRAIT COMPOSITION RULES:
- The uploaded person should feel like the HERO of the poster
- Keep face clearly visible
- Use premium portrait framing
- Maintain realistic proportions
- Avoid aggressive crop
- Avoid awkward cutoffs
- Match portrait lighting with poster background
- Use premium cinematic blending
- Add glow/rim-light only if visually suitable
- Maintain balanced spacing around the face

PLACEMENT RULES:
- Center hero composition
- Side hero composition
- Cinematic premium framing
- Emotional visual balance
- Mobile-friendly composition

MULTIPLE IMAGE RULES:
If multiple images are attached:
- Arrange elegantly
- Use premium collage/layered composition
- Keep all faces recognizable
- Maintain clean composition
- Avoid clutter

The final poster should feel like a professionally designed premium custom celebration poster centered around the uploaded person(s).
`
    : `
IMAGE MODE: DISABLED

Do NOT generate:
- random portrait-style people
- unrelated foreground faces
- fake AI portraits
- unknown hero subjects
- random close-up humans

IMPORTANT:
Contextual humans may appear ONLY if naturally suitable for the custom occasion.

Examples:
- birthday celebration atmosphere people
- anniversary silhouettes
- celebration crowd mood
- family silhouettes
- emotional gathering atmosphere
- cultural celebration participants

However:
- contextual humans must remain secondary visuals
- avoid dominant unknown portrait subjects
- avoid random foreground faces
- avoid fake AI-generated people

Focus primarily on:
- occasion identity
- emotional celebration aesthetics
- typography
- decorative visuals
- premium compositions
- cinematic lighting
- luxury celebration mood

The final poster should feel emotionally connected to the custom occasion without random portrait generation.
`
}

━━━━━━━━━━━━━━━━━━
🏢 BUSINESS BRANDING SECTION
━━━━━━━━━━━━━━━━━━

${
  promptOptions?.businessName
    ? `
Include a PREMIUM BUSINESS PANEL at the bottom.

Business Name:
${businessName}

Business styling:
- Elegant
- Premium
- Clean
- Beautifully aligned
- Professional branding style
`
    : ''
}

${
  promptOptions?.wisherName
    ? `
Wisher Name:
${wisherName}

Display elegantly ${
        promptOptions?.businessName ? 'below business details.' : 'at bottom'
      } 
`
    : ''
}

${
  promptOptions?.businessAddress
    ? `
Business Address:
${businessAddress}

Address rules:
- Place only in bottom section
- Small but readable
- Proper spacing
- Elegant typography
- Professional alignment
`
    : ''
}

${
  promptOptions?.phoneNumber
    ? `
Phone Number:
${phoneNumber}

Phone number rules:
- Stylish placement
- Small premium typography
- Neatly aligned near address
`
    : ''
}

━━━━━━━━━━━━━━━━━━
🌟 VISUAL QUALITY
━━━━━━━━━━━━━━━━━━

Poster quality must be:
- Ultra 8K
- Extremely sharp
- High detail
- Professional quality
- Mobile optimized
- Social-media ready
- Premium composition
- WhatsApp status friendly

Use:
- realistic lighting
- premium shadows
- cinematic glow
- elegant gradients
- luxury finishing
- modern texture detailing

━━━━━━━━━━━━━━━━━━
🚫 NEGATIVE RULES
━━━━━━━━━━━━━━━━━━

DO NOT:
- Add logos
- Add watermarks
- Use blurry text
- Use broken Telugu text
- Create spelling mistakes
- Overcrowd the design
- Use unrelated graphics
- Distort typography
- Use low-quality visuals
- Make text unreadable
- Create messy composition

━━━━━━━━━━━━━━━━━━
📱 FINAL OUTPUT
━━━━━━━━━━━━━━━━━━

- Aspect Ratio: 3:4
- Perfect for WhatsApp status
- Perfect for Instagram post
- Designer-quality composition
- Professional Indian social media poster
- Crystal-clear typography
- High-end premium finish

Generate a BEAUTIFUL MASTERPIECE-LEVEL CUSTOM POSTER with emotionally engaging and visually premium aesthetics.

`;
}

// ─────────────────────────────────────────────────────────────
// AI Apps
// ─────────────────────────────────────────────────────────────

const AI_APPS = [
  {
    name: 'ChatGPT',
    icon: '🤖',
    appUrl: text => `chatgpt://chat?text=${encodeURIComponent(text)}`,
    webUrl: text =>
      `https://chat.openai.com/?q=${encodeURIComponent(
        text.substring(0, 100000),
      )}`,
  },

  {
    name: 'Gemini',
    icon: '✦',
    appUrl: () => `gemini://`,
    webUrl: () => `https://gemini.google.com/`,
  },
];

async function openInAI(app, prompt) {
  const appUrl = app.appUrl(prompt);
  const webUrl = app.webUrl(prompt);

  try {
    const canOpen = await Linking.canOpenURL(appUrl);
    if (app.name === 'Gemini') {
      await Clipboard.setString(prompt);
    }
    if (canOpen) {
      await Linking.openURL(appUrl);
    } else {
      await Linking.openURL(webUrl);
    }
  } catch {
    try {
      await Linking.openURL(webUrl);
    } catch {
      toast.error(
        `Could not open ${app.name}, Copy the prompt manually and paste into ${app.name}.`,
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Step Indicator
// ─────────────────────────────────────────────────────────────

function StepIndicator({ currentStep = 1 }) {
  const steps = [
    { num: 1, label: 'Copy Prompt' },
    { num: 2, label: 'Open AI App' },
    { num: 3, label: 'Get Poster' },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
      }}
    >
      {steps.map((step, i) => {
        const isActive = step.num === currentStep;
        const isDone = step.num < currentStep;

        return (
          <React.Fragment key={step.num}>
            <View
              style={{
                alignItems: 'center',
                gap: scale(4),
              }}
            >
              {isActive ? (
                <LinearGradient
                  colors={GRADIENTS.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: scale(28),
                    height: scale(28),
                    borderRadius: scale(14),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: moderateScale(12),
                      fontFamily: 'Inter-Bold',
                    }}
                  >
                    {step.num}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={{
                    width: scale(28),
                    height: scale(28),
                    borderRadius: scale(14),
                    backgroundColor: isDone ? COLORS.primary : '#E8E8E8',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: isDone ? '#fff' : '#AAAAAA',
                      fontSize: moderateScale(12),
                      fontFamily: 'Inter-Bold',
                    }}
                  >
                    {step.num}
                  </Text>
                </View>
              )}

              <Text
                style={{
                  fontSize: moderateScale(9),
                  fontFamily: 'Inter-SemiBold',
                  color: isActive ? COLORS.primary : '#AAAAAA',
                }}
              >
                {step.label}
              </Text>
            </View>

            {i < steps.length - 1 && (
              <View
                style={{
                  flex: 1,
                  height: 1.5,
                  backgroundColor: '#E0E0E0',
                  marginBottom: scale(14),
                  marginHorizontal: scale(4),
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────

export default function PosterScreen({ navigation, route }) {
  const { event, isCustom, customParams } = route.params || {};
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [promptOptions, setPromptOptions] = useState({
    businessName: false,
    wisherName: true,
    businessAddress: false,
    phoneNumber: false,
    isTelugu: true,
    attachImage: false,
  });

  useEffect(() => {
    if (profile) {
      setPromptOptions(prev => ({
        ...prev,
        businessName: !!profile?.businessName,
      }));
    }
  }, [profile]);

  const togglePromptOption = key => {
    setPromptOptions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const eventTitle = isCustom
    ? customParams?.description || 'Custom Poster'
    : event?.name || 'Event Poster';

  const eventSubtitle = isCustom
    ? null
    : event?.date
    ? `${event.date} · ${event.category || 'National Holiday'}`
    : null;

  // ─────────────────────────────────────────
  // Load Profile
  // ─────────────────────────────────────────

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then(raw => {
        if (raw) {
          setProfile(JSON.parse(raw));
        }
      })
      .catch(() => {});
  }, []);

  // ─────────────────────────────────────────
  // Build Prompt
  // ─────────────────────────────────────────

  useEffect(() => {
    const built = isCustom
      ? buildCustomPrompt({
          customParams,
          profile,
          promptOptions,
        })
      : buildEventPrompt({
          event,
          profile,
          promptOptions,
        });

    setPrompt(built);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [profile, promptOptions]);

  // ─────────────────────────────────────────
  // Copy
  // ─────────────────────────────────────────

  const handleCopy = () => {
    Clipboard.setString(prompt);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  // ─────────────────────────────────────────
  // Share
  // ─────────────────────────────────────────

  const handleShare = async via => {
    try {
      if (via === 'whatsapp') {
        const url = `whatsapp://send?text=${encodeURIComponent(prompt)}`;
        await Linking.openURL(url);
        const canOpen = await Linking.canOpenURL(url);
      } else {
        await Share.share({
          message: prompt,
          title: `${eventTitle} — Poster Prompt`,
        });
      }
    } catch {}
  };

  const cardShadow = {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 1,
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#F5F7FA',
      }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Toast */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          elevation: 9999,
          pointerEvents: 'box-none',
        }}
      >
        <Toaster
          position="bottom-center"
          richColors
          offset={insets.top + 12}
          visibleToastCount={2}
          toastOptions={{
            style: {
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.06)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 9999,
            },
            titleStyle: {
              fontFamily: 'Inter-Bold',
              fontSize: 14,
              color: '#111827',
            },
            descriptionStyle: {
              fontFamily: 'Inter-Regular',
              fontSize: 12,
              color: '#6B7280',
              lineHeight: 17,
            },
            successStyle: {
              borderLeftWidth: 4,
              borderLeftColor: '#10B981',
            },
            errorStyle: {
              borderLeftWidth: 4,
              borderLeftColor: '#EF4444',
            },
            infoStyle: {
              borderLeftWidth: 4,
              borderLeftColor: '#3B82F6',
            },
          }}
        />
      </View>

      {/* Header */}

      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingTop: verticalScale(52),
          borderBottomWidth: 1,
          borderBottomColor: '#F0F0F0',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: scale(16),
            paddingBottom: verticalScale(12),
          }}
        >
          <View
            style={{
              zIndex: 10,
              elevation: 10,
            }}
          >
            <BackButton onPress={() => navigation.goBack()} />
          </View>

          <View
            style={{
              flex: 1,
              alignItems: 'center',
              marginRight: scale(32),
            }}
          >
            <Text
              style={{
                fontSize: moderateScale(16),
                fontFamily: 'Inter-Bold',
                textAlign: 'center',
                color: '#1A1A2E',
              }}
            >
              {isCustom ? 'Your AI Prompt is Ready! ✨' : eventTitle}
            </Text>

            {eventSubtitle && (
              <Text
                style={{
                  fontSize: moderateScale(11),
                  color: '#888',
                  fontFamily: 'Inter-Regular',
                  textAlign: 'center',
                  marginTop: 2,
                }}
              >
                {eventSubtitle}
              </Text>
            )}
          </View>
        </View>

        <StepIndicator currentStep={2} />
      </View>

      {/* Content */}

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: scale(16),
          paddingBottom: verticalScale(40),
        }}
      >
        {/* Prompt Card */}

        <Animated.View style={{ opacity: fadeAnim }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: moderateScale(16),
              marginBottom: scale(16),
              overflow: 'hidden',
              ...cardShadow,
            }}
          >
            {/* Header */}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: scale(16),
                paddingVertical: scale(12),
                borderBottomWidth: 1,
                borderBottomColor: '#F0F0F0',
              }}
            >
              <Text
                style={{
                  fontSize: moderateScale(13),
                  fontFamily: 'Inter-Bold',
                  color: '#1A1A2E',
                }}
              >
                {isCustom ? 'Your Prompt' : 'AI Poster Prompt'}
              </Text>

              <TouchableOpacity
                onPress={handleCopy}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#DDDDDD',
                  borderRadius: moderateScale(8),
                  paddingHorizontal: scale(10),
                  paddingVertical: scale(5),
                  gap: scale(4),
                }}
              >
                {copied ? '' : <Copy size={14} color="#0D47A1" />}

                <Text
                  style={{
                    fontSize: moderateScale(12),
                    fontFamily: 'Inter-SemiBold',
                    color: '#444',
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Prompt */}

            <View
              style={{
                padding: scale(16),
              }}
            >
              <Text
                selectable
                numberOfLines={expanded ? 9999 : 8}
                style={{
                  color: '#333',
                  fontSize: moderateScale(13),
                  fontFamily: 'Inter-Regular',
                  lineHeight: moderateScale(21),
                }}
              >
                {prompt}
              </Text>

              {/* Expand Button */}

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setExpanded(!expanded)}
                style={{
                  marginTop: verticalScale(16),

                  alignSelf: 'center',

                  minWidth: scale(300),

                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',

                  paddingVertical: verticalScale(12),
                  paddingHorizontal: scale(24),

                  borderRadius: scale(30),

                  backgroundColor: '#F5F7FF',

                  borderWidth: 1,
                  borderColor: '#E3E8FF',

                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: moderateScale(14),
                    fontFamily: 'Inter-Bold',
                    color: '#2563EB',

                    marginRight: scale(8),
                  }}
                >
                  {expanded ? 'Show Less' : 'Show More'}
                </Text>

                {expanded ? (
                  <ChevronUp size={18} color="#2563EB" strokeWidth={2.5} />
                ) : (
                  <ChevronDown size={18} color="#2563EB" strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: moderateScale(18),
            padding: scale(16),
            marginBottom: scale(18),

            ...cardShadow,
          }}
        >
          {/* Header */}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: verticalScale(14),
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: moderateScale(14),
                  fontFamily: 'Inter-Bold',
                  color: '#1A1A2E',
                }}
              >
                Prompt Details
              </Text>

              <Text
                style={{
                  fontSize: moderateScale(11),
                  color: '#777',
                  fontFamily: 'Inter-Regular',
                  marginTop: 3,
                }}
              >
                Select details to include in AI prompt
              </Text>
            </View>

            <View
              style={{
                width: scale(42),
                height: scale(42),
                borderRadius: scale(21),
                backgroundColor: '#EEF4FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Astroid size={22} color="#0D47A1" />
            </View>
          </View>

          {/* Toggle List */}

          {[
            {
              key: 'businessName',
              title: 'Business Name',
              subtitle: 'Include business/store name',
              Icon: Building2,
              isDisplay: !!profile?.businessName,
            },

            {
              key: 'wisherName',
              title: 'Wisher Name',
              subtitle: 'Include greeting sender',
              Icon: CircleUserRound,
              isDisplay: true,
            },

            {
              key: 'businessAddress',
              title: 'Business Address',
              subtitle: 'Include address in footer',
              Icon: MapPin,
              isDisplay: !!profile?.businessAddress,
            },

            {
              key: 'phoneNumber',
              title: 'Phone Number',
              subtitle: 'Include contact number',
              Icon: Phone,
              isDisplay: !!profile?.phone,
            },

            {
              key: 'isTelugu',
              title: 'Telugu Language',
              subtitle: 'Toggle for poster in Telugu',
              Icon: Languages,
              isDisplay: true,
            },

            {
              key: 'attachImage',
              title: 'Attach Image',
              subtitle: 'Toggle to attach image',
              Icon: Paperclip,
              isDisplay: true,
            },
          ]
            .filter(item => item.isDisplay)
            .map(item => {
              const enabled = promptOptions[item.key];

              const IconComponent = item.Icon;

              return (
                <View
                  key={item.key}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',

                    paddingVertical: verticalScale(12),

                    borderTopWidth: 1,
                    borderTopColor: '#F1F1F1',
                  }}
                >
                  {/* Left */}

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: scale(40),
                        height: scale(40),
                        borderRadius: scale(12),

                        backgroundColor: enabled ? '#EEF4FF' : '#F4F4F4',

                        alignItems: 'center',
                        justifyContent: 'center',

                        marginRight: scale(12),
                      }}
                    >
                      <IconComponent
                        size={22}
                        color={enabled ? '#0D47A1' : '#6B7280'}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: moderateScale(13),
                          fontFamily: 'Inter-SemiBold',
                          color: '#1A1A2E',
                        }}
                      >
                        {item.title}
                      </Text>

                      <Text
                        style={{
                          fontSize: moderateScale(11),
                          color: '#8A8A8A',
                          fontFamily: 'Inter-Regular',
                          marginTop: 2,
                        }}
                      >
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>

                  {/* Toggle */}

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => togglePromptOption(item.key)}
                    style={{
                      width: scale(52),
                      height: scale(30),
                      borderRadius: scale(15),

                      backgroundColor: enabled ? '#0D47A1' : '#D1D5DB',

                      padding: scale(3),

                      justifyContent: 'center',
                    }}
                  >
                    <Animated.View
                      style={{
                        width: scale(24),
                        height: scale(24),
                        borderRadius: scale(12),

                        backgroundColor: '#FFFFFF',

                        alignSelf: enabled ? 'flex-end' : 'flex-start',
                      }}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
        </View>
        {/* AI Apps */}

        <Text
          style={{
            fontSize: moderateScale(13),
            fontFamily: 'Inter-Bold',
            color: '#1A1A2E',
            marginBottom: scale(10),
          }}
        >
          Open in AI App
        </Text>

        <View
          style={{
            flexDirection: 'row',
            gap: scale(12),
            marginBottom: scale(20),
          }}
        >
          {AI_APPS.map(app => (
            <TouchableOpacity
              key={app.name}
              onPress={() => openInAI(app, prompt)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: moderateScale(16),
                paddingVertical: scale(14),
                borderWidth: 1,
                borderColor: '#F1F1F1',
                gap: scale(10),
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 6,
                },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              {app.name === 'ChatGPT' ? (
                <View
                  style={{
                    width: scale(22),
                    height: scale(22),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    source={require('../../assets/images/chatgpt.png')} // change path if needed
                    style={{
                      width: scale(20),
                      height: verticalScale(20),
                      resizeMode: 'contain',
                    }}
                  />
                </View>
              ) : (
                <View
                  style={{
                    width: scale(22),
                    height: scale(22),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    source={require('../../assets/images/geminiai.png')} // change path if needed
                    style={{
                      width: scale(20),
                      height: verticalScale(20),
                      resizeMode: 'contain',
                    }}
                  />
                </View>
              )}

              <Text
                style={{
                  fontSize: moderateScale(13),
                  fontFamily: 'Inter-SemiBold',
                  color: '#1A1A2E',
                }}
              >
                {app.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Share Row */}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: scale(16),
          }}
        >
          <Text
            style={{
              fontSize: moderateScale(13),
              fontFamily: 'Inter-SemiBold',
              color: '#1A1A2E',
            }}
          >
            Share via
          </Text>

          <View className="flex flex-row gap-3 ml-5">
            {/* WhatsApp */}

            <TouchableOpacity
              onPress={() => handleShare('whatsapp')}
              activeOpacity={0.8}
              style={{
                width: scale(44),
                height: scale(44),
                borderRadius: scale(60),
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                ...cardShadow,
              }}
            >
              <Image
                source={require('../../assets/images/whatsapp.png')}
                style={{
                  width: scale(30),
                  height: verticalScale(30),
                  resizeMode: 'contain',
                }}
              />
            </TouchableOpacity>

            {/* Generic Share */}

            <TouchableOpacity
              onPress={() => handleShare('other')}
              activeOpacity={0.8}
              style={{
                width: scale(42),
                height: scale(42),
                borderRadius: scale(21),
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                ...cardShadow,
              }}
            >
              <Share2 size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
