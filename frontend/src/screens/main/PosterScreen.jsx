// src/screens/main/PosterScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Linking,
  Share,
  Animated,
  Platform,
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
  ImageIcon,
} from 'lucide-react-native';
import { NativeModules } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import BackButton from '../../components/common/BackButton';
import { PROFILE_KEY } from './HomeScreen';
import { toast, Toaster } from 'sonner-native';
import RNShare from 'react-native-share';
import { getProfileImage } from '../../utils/profileImage';
import RNFS from 'react-native-fs';

const { ShareToAI } = NativeModules;
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

Generate a MASTERPIECE-LEVEL EVENT POSTER with premium balanced Indian social media aesthetics.`;
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

  return `Create a PREMIUM HIGH-QUALITY CUSTOM SOCIAL MEDIA POSTER based on the following custom event or occasion:

"${description}"

━━━━━━━━━━━━━━━━━━
🎨 DESIGN DIRECTION
━━━━━━━━━━━━━━━━━━

The poster must look professionally designed by an expert Indian social media poster designer.

IMPORTANT:
The entire poster design, visual mood, composition, typography, decorations, atmosphere, lighting, colors, and layout MUST be intelligently generated according to the custom event description.

The AI must deeply understand the meaning, emotion, importance, and context of the custom description and generate visuals specifically matching that event.

DO NOT assume every poster is birthday-style or greeting-style.

The poster style must dynamically adapt according to the custom event.

Examples:

- Birthday → vibrant celebration aesthetics
- Wedding Anniversary → romantic luxury visuals
- Congratulations → achievement-focused premium style
- Political Event → powerful public-event composition
- Business Opening → grand professional launch visuals
- Memorial Tribute → emotional respectful atmosphere
- Temple Event → spiritual devotional aesthetics
- Farewell Event → emotional cinematic mood
- Cultural Program → traditional artistic visuals
- Motivation Quote → minimal inspirational design
- Personal Branding → modern stylish composition
- Festival Greetings → festive cultural atmosphere
- Family Event → warm emotional aesthetics
- Professional Seminar → clean corporate premium style
- Social Awareness Event → meaningful emotional storytelling

━━━━━━━━━━━━━━━━━━
🧠 AI EVENT UNDERSTANDING
━━━━━━━━━━━━━━━━━━

The AI must intelligently decide the overall poster styling according to the event type, emotional tone, cultural context, and occasion importance.

The poster may become:
- grand
- luxurious
- festive
- elegant
- emotional
- cinematic
- minimal
- modern
- spiritual
- premium
- stylish
- professional
- energetic
- traditional
- cool
- soft
- vibrant
- royal

depending entirely on what best suits the custom event.

IMPORTANT:
Do NOT force every poster to look luxurious or overly grand.

Some events require:
- clean minimal aesthetics
- emotional simplicity
- professional modern design
- soft respectful atmosphere
- elegant premium balance
- subtle stylish composition

while other events may require:
- rich grand celebration visuals
- luxury decorative styling
- cinematic premium atmosphere
- festive cultural richness
- powerful energetic layouts

The AI should automatically analyze the custom description and decide:
- visual intensity
- decoration level
- luxury level
- emotional tone
- lighting style
- typography mood
- composition complexity
- cultural styling
- background richness
- overall atmosphere

according to the event naturally.

The final poster should feel intelligently custom-designed specifically for the provided event description instead of using repetitive template-like styling.

━━━━━━━━━━━━━━━━━━
🎯 EVENT DETAILS
━━━━━━━━━━━━━━━━━━

Person Name:
${personName}

Custom Event / Description / Wishes:
${description}

━━━━━━━━━━━━━━━━━━
🖼️ VISUAL STYLE & BACKGROUND
━━━━━━━━━━━━━━━━━━

Generate visuals dynamically according to the custom event.

Use only relevant visual elements suitable for the event.

Possible elements:
- festival visuals
- flowers
- celebration particles
- cinematic lighting
- confetti
- elegant gradients
- luxury ornaments
- decorative borders
- traditional patterns
- spiritual aesthetics
- emotional cinematic mood
- modern premium textures
- cultural elements
- stylish abstract visuals
- professional design elements
- artistic compositions

Use visual elements ONLY when suitable for the event.

The background should feel:
- premium
- professional
- emotionally connected
- social-media-ready
- visually balanced
- beautifully composed

Avoid:
- unnecessary decorations
- random graphics
- template-like styling
- cluttered compositions
- unrelated visuals

━━━━━━━━━━━━━━━━━━
👤 PERSON FOCUS
━━━━━━━━━━━━━━━━━━

"${personName}" should be highlighted naturally according to the event.

The name should:
- stand out clearly
- feel premium
- look visually attractive
- match the event mood
- remain readable on mobile
- blend naturally into the composition

━━━━━━━━━━━━━━━━━━
📝 TYPOGRAPHY RULES
━━━━━━━━━━━━━━━━━━

Typography must dynamically adapt according to the custom event mood.

Examples:
- emotional events → elegant soft typography
- celebration events → vibrant stylish typography
- professional events → clean premium typography
- spiritual events → traditional elegant typography
- luxury events → classy cinematic typography

Typography should feel:
- premium
- elegant
- balanced
- modern
- professional
- highly readable

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
💬 WISHES / MESSAGE SECTION
━━━━━━━━━━━━━━━━━━

Generate a suitable wishes message or supporting text according to the custom event.

The text should feel:
- emotional
- natural
- elegant
- premium
- human-like
- socially engaging

Keep it concise and beautifully written.

━━━━━━━━━━━━━━━━━━
📐 POSTER LAYOUT
━━━━━━━━━━━━━━━━━━

Use a professional balanced layout.

Possible layout structure:
1. Event-related visual atmosphere
2. Main event headline
3. Person highlight section
4. Supporting wishes/message
5. Decorative or minimal separators if suitable
6. Premium branding/footer section

The layout should intelligently adapt according to the event.

Maintain:
- proper spacing
- clean hierarchy
- visual balance
- cinematic composition
- premium social-media aesthetics
- mobile readability

━━━━━━━━━━━━━━━━━━
🖼️ ATTACHED IMAGE HANDLING
━━━━━━━━━━━━━━━━━━

${
  promptOptions?.attachImage
    ? `
IMAGE MODE: ENABLED

The uploaded image(s) represent important people related to the custom event.

IMPORTANT:
The uploaded image(s) must be naturally integrated into the poster with visually balanced professional placement.

The AI should intelligently decide:
- image size
- image position
- framing style
- blending style
- portrait prominence

according to the event type and poster composition.

STRICT RULES:
- Use ONLY uploaded image(s) for real people portraits
- Do NOT generate fake people
- Do NOT replace uploaded faces
- Preserve identity accurately
- Keep faces natural and recognizable
- Avoid distorted faces
- Avoid AI-looking portraits

IMAGE COMPOSITION RULES:
- The uploaded image should blend naturally into the poster
- Maintain proper spacing around the portrait
- Avoid oversized face placement
- Avoid awkward cropping
- Avoid covering important text
- Avoid unbalanced layouts
- Maintain premium professional composition

BALANCED PLACEMENT RULES:
The AI should intelligently choose placement depending on the event.

Possible placements:
- Center hero portrait
- Side portrait composition
- Bottom-corner elegant branding placement
- Soft blended background portrait
- Layered cinematic composition
- Premium framed portrait section
- Multi-image collage layout

The image placement should ALWAYS feel:
- balanced
- professional
- premium
- visually clean
- emotionally connected to the event

IMPORTANT:
The EVENT itself should remain the primary visual identity of the poster.

The uploaded image should SUPPORT the event composition naturally instead of overpowering the poster unless the event specifically requires hero portrait focus.

MULTIPLE IMAGE RULES:
If multiple images are attached:
- arrange them elegantly
- maintain visual hierarchy
- keep all faces visible
- avoid clutter
- use premium collage/layered composition

The final output should feel like a professionally designed premium custom event poster with perfectly balanced image integration.
`
    : `
IMAGE MODE: DISABLED

Do NOT generate:
- fake portraits
- random foreground people
- unrelated human subjects
- AI-generated business-owner faces
- random close-up portraits

Focus primarily on:
- event identity
- visual storytelling
- typography
- cinematic aesthetics
- premium composition
- emotional atmosphere
- balanced visuals
`
}

${
  promptOptions?.businessName
    ? `
━━━━━━━━━━━━━━━━━━
🏢 BUSINESS BRANDING SECTION
━━━━━━━━━━━━━━━━━━

Include a premium business branding section.

Business Name:
${businessName}

Business styling should feel:
- elegant
- premium
- balanced
- professional
- visually integrated
`
    : ''
}

${
  promptOptions?.wisherName
    ? `
Wisher Name:
${wisherName}

Display elegantly ${
        promptOptions?.businessName
          ? 'below the business section'
          : 'within the footer section'
      }.
`
    : ''
}

${
  promptOptions?.businessAddress
    ? `
Business Address:
${businessAddress}

Address should:
- remain small but readable
- stay properly aligned
- appear only in footer/business section
- maintain elegant spacing
`
    : ''
}

${
  promptOptions?.phoneNumber
    ? `
Phone Number:
${phoneNumber}

Phone number should:
- look premium
- remain readable
- integrate naturally into the footer
`
    : ''
}

━━━━━━━━━━━━━━━━━━
🌟 VISUAL QUALITY
━━━━━━━━━━━━━━━━━━

Poster quality must be:
- Ultra 8K
- extremely sharp
- highly detailed
- professional quality
- social-media ready
- mobile optimized
- visually premium
- WhatsApp status friendly

Use:
- cinematic lighting
- premium shadows
- elegant gradients
- realistic depth
- modern textures
- stylish visual layering
- balanced compositions

━━━━━━━━━━━━━━━━━━
🚫 NEGATIVE RULES
━━━━━━━━━━━━━━━━━━

DO NOT:
- add logos
- add watermarks
- use blurry text
- create spelling mistakes
- generate broken Telugu text
- overcrowd the layout
- use unrelated visuals
- create messy composition
- distort typography
- create low-quality graphics
- overuse decorations
- make every poster look identical

━━━━━━━━━━━━━━━━━━
📱 FINAL OUTPUT
━━━━━━━━━━━━━━━━━━

- Aspect Ratio: 3:4
- Perfect for WhatsApp status
- Perfect for Instagram post
- Designer-quality composition
- Premium Indian social media poster
- Crystal-clear typography
- High-end premium finish

Generate a BEAUTIFUL MASTERPIECE-LEVEL CUSTOM EVENT POSTER with emotionally engaging, visually balanced, intelligently designed premium aesthetics.`;
}

// ─────────────────────────────────────────────────────────────
// AI Apps
// ─────────────────────────────────────────────────────────────

const AI_APPS = [
  {
    name: 'ChatGPT',
    icon: '🤖',
  },

  {
    name: 'Gemini',
    icon: '✦',
  },
];

const PACKAGE_NAMES = {
  ChatGPT: 'com.openai.chatgpt',
  Gemini: 'com.google.android.apps.bard',
};

const AI_APP_PACKAGES = {
  ChatGPT: ['com.openai.chatgpt'],

  Gemini: [
    'com.google.android.apps.bard',
    'com.google.android.googlequicksearchbox',
  ],
  WhatsApp: ['com.whatsapp'],
};

const APP_LINKS = {
  ChatGPT: 'https://play.google.com/store/apps/details?id=com.openai.chatgpt',
  Gemini:
    'https://play.google.com/store/apps/details?id=com.google.android.apps.bard',
  WhatsApp: 'https://play.google.com/store/apps/details?id=com.whatsapp',
};

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
  const { event, isCustom = false, customParams = {} } = route.params || {};
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('full');
  const [promptOptions, setPromptOptions] = useState({
    businessName: false,
    wisherName: true,
    businessAddress: false,
    phoneNumber: false,
    isTelugu: true,
    attachImage: true,
  });

  useEffect(() => {
    if (profile) {
      applyPreset('full');
      setPromptOptions(prev => ({
        ...prev,
        businessName: isCustom ? false : !!profile?.businessName,
        businessAddress: isCustom ? false : false,
        phoneNumber: isCustom ? false : false,
      }));
    }
  }, [profile, isCustom]);

  const togglePromptOption = key => {
    // Prevent disabling
    // custom uploaded image
    if (key === 'attachImage' && isCustom && customImage) {
      return;
    }

    setPromptOptions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const applyPreset = preset => {
    setSelectedPreset(preset);

    // FULL BRANDING
    if (preset === 'full') {
      setPromptOptions({
        businessName: !isCustom && !!profile?.businessName,
        wisherName: true,
        businessAddress: !isCustom && !!profile?.businessAddress,
        phoneNumber: !isCustom && !!profile?.phone,
        isTelugu: true,
        attachImage: isCustom ? !!customImage : true,
      });

      return;
    }

    // CUSTOM MODE
    if (preset === 'custom') {
      setPromptOptions(prev => ({
        ...prev,
      }));
    }
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
  const customImage = customParams?.customImage;

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

  useEffect(() => {
    // Auto enable image sharing
    // for custom uploaded image
    if (isCustom && customImage) {
      setPromptOptions(prev => ({
        ...prev,
        attachImage: true,
      }));
    }
  }, [isCustom, customImage]);

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
  }, [profile, promptOptions, customParams, event, isCustom]);

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

  const checkAIAppInstalled = async appName => {
    try {
      const packages = AI_APP_PACKAGES[appName] || [];

      for (const pkg of packages) {
        const installed = await ShareToAI.isAppInstalled(pkg);

        if (installed) {
          return pkg;
        }
      }

      return null;
    } catch (e) {
      console.log('INSTALL CHECK ERROR:', e);

      return null;
    }
  };

  const showAppNotInstalled = appName => {
    toast.error(`${appName} is not installed`, {
      description: 'Redirecting to Play Store...',
      duration: 2500,
    });

    setTimeout(() => {
      Linking.openURL(APP_LINKS[appName]);
    }, 1800);
  };

  //openinaiapps
  const openInAI = async (app, prompt, options = {}) => {
    try {
      const packageName = await checkAIAppInstalled(app.name);
      if (!packageName) {
        showAppNotInstalled(app.name);
        return;
      }

      const { attachImage = false, isCustom = false } = options;

      // Determine image usage
      const shouldAttachImage =
        attachImage && (!isCustom || (isCustom && !!customImage));

      let savedImage = null;

      // ─────────────────────────────
      // GET IMAGE
      // ─────────────────────────────

      if (shouldAttachImage) {
        // Custom uploaded image
        if (isCustom && customImage) {
          savedImage = customImage;
        } else {
          // Profile image
          savedImage = await getProfileImage();
        }
      }

      // ─────────────────────────────
      // IMAGE + PROMPT MODE
      // ─────────────────────────────

      if (savedImage) {
        // Copy prompt always
        Clipboard.setString(prompt);
        await ShareToAI.shareToApp(packageName, savedImage, prompt);
        return;
      }

      // ─────────────────────────────
      // PROMPT ONLY MODE
      // ─────────────────────────────

      await ShareToAI.shareTextToApp(packageName, prompt);
    } catch (error) {
      console.log('OPEN AI ERROR:', error);

      toast.error(`Could not open ${app.name}`);
    }
  };

  // ─────────────────────────────────────────
  // Share
  // ─────────────────────────────────────────

  const handleShare = async via => {
    try {
      // WhatsApp
      if (via === 'whatsapp') {
        const packageName = await checkAIAppInstalled('WhatsApp');

        if (!packageName) {
          toast.error('WhatsApp is not installed');

          return;
        }

        // IMAGE + TEXT
        if (customImage || promptOptions?.attachImage) {
          let imagePath = null;

          // Custom uploaded image
          if (isCustom && customImage) {
            imagePath = customImage;
          }

          // Profile image
          else if (promptOptions?.attachImage) {
            imagePath = await getProfileImage();
          }

          // Share image + prompt
          if (imagePath) {
            await ShareToAI.shareToApp(packageName, imagePath, prompt);

            return;
          }
        }

        // Text only
        await ShareToAI.shareTextToApp(packageName, prompt);

        return;
      }

      // Generic Share
      await Share.share({
        message: prompt,
        title: `${eventTitle} — Poster Prompt`,
      });
    } catch (e) {
      console.log('WHATSAPP SHARE ERROR:', e);

      toast.error('Could not share');
    }
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
              marginBottom: verticalScale(18),
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: moderateScale(15),
                  fontFamily: 'Inter-Bold',
                  color: '#1A1A2E',
                }}
              >
                Prompt Style
              </Text>

              <Text
                style={{
                  fontSize: moderateScale(11),
                  color: '#777',
                  fontFamily: 'Inter-Regular',
                  marginTop: 3,
                }}
              >
                Choose how AI should generate poster
              </Text>
            </View>

            <View
              style={{
                width: scale(44),
                height: scale(44),
                borderRadius: scale(22),
                backgroundColor: '#EEF4FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Astroid size={22} color="#2563EB" />
            </View>
          </View>

          {/* Toggle List */}
          <View
            style={{
              flexDirection: 'row',
              gap: scale(10),
              marginBottom: verticalScale(18),
            }}
          >
            {[
              {
                key: 'full',
                label: 'Recommended (Telugu)',
              },
              {
                key: 'custom',
                label: 'Customize',
              },
            ].map(item => {
              const active = selectedPreset === item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.9}
                  onPress={() => applyPreset(item.key)}
                  style={{
                    flex: 1,

                    paddingVertical: verticalScale(13),

                    borderRadius: scale(16),

                    backgroundColor: active ? '#2563EB' : '#F3F4F6',

                    alignItems: 'center',

                    borderWidth: 1,

                    borderColor: active ? '#2563EB' : '#E5E7EB',
                  }}
                >
                  <Text
                    style={{
                      color: active ? '#FFFFFF' : '#374151',

                      fontSize: moderateScale(12),

                      fontFamily: 'Inter-Bold',
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedPreset === 'custom' && (
            <>
              {[
                {
                  key: 'businessName',
                  title: 'Business Name',
                  subtitle: 'Include business/store name',
                  Icon: Building2,
                  isDisplay: !isCustom && !!profile?.businessName,
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
                  isDisplay: !isCustom && !!profile?.businessAddress,
                },

                {
                  key: 'phoneNumber',
                  title: 'Phone Number',
                  subtitle: 'Include contact number',
                  Icon: Phone,
                  isDisplay: !isCustom && !!profile?.phone,
                },

                {
                  key: 'isTelugu',
                  title: 'Telugu Poster',
                  subtitle: 'Toggle for poster in Telugu',
                  Icon: Languages,
                  isDisplay: true,
                },

                {
                  key: 'attachImage',
                  title: 'Attach Image',
                  subtitle: isCustom
                    ? customImage
                      ? 'Custom uploaded image will be shared'
                      : 'No custom image selected'
                    : 'Profile image will be shared',
                  Icon: ImageIcon,
                  isDisplay: true,
                  disabled: isCustom && !!customImage,
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
                        onPress={() => {
                          if (item.disabled) {
                            return;
                          }
                          togglePromptOption(item.key);
                        }}
                        style={{
                          width: scale(52),
                          height: scale(30),
                          opacity: item.disabled ? 0.65 : 1,
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
            </>
          )}
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
              onPress={() =>
                openInAI(app, prompt, {
                  attachImage: promptOptions.attachImage,
                  isCustom,
                })
              }
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
