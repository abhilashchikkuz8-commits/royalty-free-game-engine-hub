import { useCallback, useEffect, useState } from "react";
import { AssetCategory } from "./backend";
import type { Asset } from "./backend.d.ts";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

// ─── Types ───────────────────────────────────────────────────────────────────

type Section =
  | "dashboard"
  | "engines"
  | "tutorials"
  | "assets"
  | "community"
  | "projects";

interface Engine {
  id: string;
  name: string;
  version: string;
  license: string;
  category: "2D" | "3D" | "Both" | "Framework";
  platforms: string[];
  features: string[];
  tags: string[];
  emoji: string;
  description: string;
  website: string;
  stars: number;
}

interface Tutorial {
  id: string;
  title: string;
  engineId: string;
  skillLevel: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  views: string;
  author: string;
  description: string;
  content: string;
  tags: string[];
}

interface Channel {
  id: string;
  name: string;
  emoji: string;
  description: string;
  postCount: number;
}

interface Post {
  id: string;
  channelId: string;
  title: string;
  content: string;
  author: string;
  replyCount: number;
  views: number;
  tags: string[];
  time: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  author: string;
  content: string;
  time: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  engine: string;
  status: "active" | "completed" | "archived";
  progress: number;
  tasks: Task[];
  milestones: Milestone[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
}

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface SampleAsset {
  id: string;
  name: string;
  description: string;
  category: string;
  engineTags: string[];
  fileSize: string;
  downloadCount: number;
  emoji: string;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const ENGINES: Engine[] = [
  {
    id: "godot",
    name: "Godot",
    version: "4.3",
    license: "MIT",
    category: "Both",
    platforms: ["Windows", "macOS", "Linux", "Android", "iOS", "Web"],
    features: [
      "Visual scripting",
      "GDScript & C#",
      "Built-in physics",
      "Animation system",
      "2D & 3D support",
    ],
    tags: ["FOSS", "Beginner-Friendly", "Indie"],
    emoji: "🎮",
    description:
      "A free, open-source game engine with a unique approach to game development. Godot provides a comprehensive set of common tools, so you can focus on making games without reinventing the wheel.",
    website: "https://godotengine.org",
    stars: 87000,
  },
  {
    id: "o3de",
    name: "O3DE",
    version: "23.10",
    license: "Apache 2.0",
    category: "3D",
    platforms: ["Windows", "Linux"],
    features: [
      "AAA-quality renderer",
      "Modular architecture",
      "Lua scripting",
      "Multiplayer framework",
      "Atom renderer",
    ],
    tags: ["AAA", "Modular", "Enterprise"],
    emoji: "🔷",
    description:
      "Open 3D Engine (O3DE) is an open-source, real-time 3D development engine. O3DE is designed to build AAA games, cinema-quality 3D worlds, and high-fidelity simulations.",
    website: "https://o3de.org",
    stars: 7200,
  },
  {
    id: "defold",
    name: "Defold",
    version: "1.7",
    license: "Free to use",
    category: "2D",
    platforms: ["Windows", "macOS", "Linux", "Android", "iOS", "Web"],
    features: [
      "Lua scripting",
      "Atlas-based sprites",
      "Built-in particle FX",
      "Hot reloading",
      "Small bundle size",
    ],
    tags: ["Mobile", "2D-Focus", "Lua"],
    emoji: "🌀",
    description:
      "Defold is a completely free to use game engine for development of desktop, mobile and web games. It is used by professional studios worldwide.",
    website: "https://defold.com",
    stars: 3800,
  },
  {
    id: "bevy",
    name: "Bevy",
    version: "0.13",
    license: "MIT",
    category: "3D",
    platforms: ["Windows", "macOS", "Linux", "Web"],
    features: [
      "ECS architecture",
      "Rust-based",
      "Data-driven design",
      "WebAssembly support",
      "Hot reloading",
    ],
    tags: ["ECS", "Rust", "Modern"],
    emoji: "🦀",
    description:
      "Bevy is a refreshingly simple data-driven game engine built in Rust. It is free and open-source forever. Bevy features a modern Entity Component System.",
    website: "https://bevyengine.org",
    stars: 33000,
  },
  {
    id: "love2d",
    name: "LÖVE",
    version: "11.5",
    license: "MIT",
    category: "2D",
    platforms: ["Windows", "macOS", "Linux", "Android", "iOS"],
    features: [
      "Lua scripting",
      "Fast prototyping",
      "OpenGL rendering",
      "Physics via Box2D",
      "Simple API",
    ],
    tags: ["Lightweight", "2D", "Lua"],
    emoji: "💚",
    description:
      "LÖVE is an awesome framework for making 2D games in Lua. It is free, open-source, and works on Windows, Mac OS X, Linux, Android, and iOS.",
    website: "https://love2d.org",
    stars: 4200,
  },
  {
    id: "armory",
    name: "Armory3D",
    version: "0.1",
    license: "Zlib",
    category: "3D",
    platforms: ["Windows", "macOS", "Linux", "Android", "iOS", "Web"],
    features: [
      "Blender integration",
      "Haxe scripting",
      "PBR rendering",
      "Visual logic nodes",
      "Export anywhere",
    ],
    tags: ["Blender", "3D", "Integrated"],
    emoji: "🔨",
    description:
      "Armory3D is an open-source 3D game engine with full Blender integration, turning Blender into a complete game development tool.",
    website: "https://armory3d.org",
    stars: 2900,
  },
];

const TUTORIALS: Tutorial[] = [
  {
    id: "t1",
    title: "Getting Started with Godot 4",
    engineId: "godot",
    skillLevel: "Beginner",
    duration: "15 min",
    views: "12.4k",
    author: "GodotGuru",
    description: "Learn the basics of Godot 4 and set up your first project.",
    tags: ["setup", "basics"],
    content: `# Getting Started with Godot 4

Godot 4 is a powerful, free and open-source game engine. In this tutorial, we\'ll set up a new project and explore the editor.

## Installation

1. Download Godot from [godotengine.org](https://godotengine.org)
2. Extract the archive — no installation needed
3. Run the Godot executable

## Creating Your First Project

\`\`\`
~/projects $ godot --new-project my_game
\`\`\`

Open the editor, create a new scene, and add a Node2D as your root node.

## The Editor Layout

- **Scene panel** (left): your scene tree
- **Viewport** (center): visual editor
- **Inspector** (right): properties of selected node
- **FileSystem** (bottom): project files

You\'re ready to build your first game!`,
  },
  {
    id: "t2",
    title: "2D Platformer in Godot",
    engineId: "godot",
    skillLevel: "Intermediate",
    duration: "45 min",
    views: "8.2k",
    author: "IndieDevPro",
    description: "Build a full 2D platformer with physics and animations.",
    tags: ["2d", "physics", "animation"],
    content: `# 2D Platformer in Godot

In this tutorial we build a classic 2D platformer with jump mechanics and enemy AI.

## CharacterBody2D Setup

\`\`\`gdscript
extends CharacterBody2D

const SPEED = 130.0
const JUMP_VELOCITY = -400.0
var gravity = ProjectSettings.get_setting("physics/2d/default_gravity")

func _physics_process(delta):
    if not is_on_floor():
        velocity.y += gravity * delta
    if Input.is_action_just_pressed("jump") and is_on_floor():
        velocity.y = JUMP_VELOCITY
    var direction = Input.get_axis("move_left", "move_right")
    velocity.x = direction * SPEED
    move_and_slide()
\`\`\``,
  },
  {
    id: "t3",
    title: "O3DE Scene Setup",
    engineId: "o3de",
    skillLevel: "Beginner",
    duration: "20 min",
    views: "3.1k",
    author: "O3DEDev",
    description: "Create and configure your first O3DE scene.",
    tags: ["setup", "scene"],
    content: `# O3DE Scene Setup

O3DE (Open 3D Engine) is designed for AAA-quality games. Let\'s set up a basic scene.

## Create a New Level

1. File → New Level
2. Name it "MainLevel"
3. Choose terrain preset

## Add Components

Select an entity in the Entity Outliner and add:
- **Mesh** component for 3D models
- **PhysX Collider** for physics
- **Script Canvas** for visual scripting

## The Atom Renderer

O3DE uses the Atom renderer for photorealistic graphics. Configure lighting via the **Global Illumination** component.`,
  },
  {
    id: "t4",
    title: "Defold Basics: Sprites & Input",
    engineId: "defold",
    skillLevel: "Beginner",
    duration: "25 min",
    views: "5.6k",
    author: "DefoldFan",
    description: "Work with sprites and handle player input in Defold.",
    tags: ["sprites", "input", "2d"],
    content: `# Defold Basics: Sprites & Input

Defold is a lightweight 2D engine. Let\'s add a sprite and handle keyboard input.

## Atlas Setup

Create an atlas (.atlas) and add your PNG images.
Reference the atlas in a Sprite component:

\`\`\`lua
-- script.script
function init(self)
    msg.post(".", "acquire_input_focus")
end

function on_input(self, action_id, action)
    if action_id == hash("move_right") then
        local pos = go.get_position()
        pos.x = pos.x + 3
        go.set_position(pos)
    end
end
\`\`\``,
  },
  {
    id: "t5",
    title: "Bevy ECS Fundamentals",
    engineId: "bevy",
    skillLevel: "Intermediate",
    duration: "60 min",
    views: "4.3k",
    author: "RustGameDev",
    description: "Master Bevy's Entity Component System architecture.",
    tags: ["ecs", "rust", "architecture"],
    content: `# Bevy ECS Fundamentals

Bevy\'s ECS is the heart of the engine. Learn components, systems, and queries.

\`\`\`rust
use bevy::prelude::*;

#[derive(Component)]
struct Player { speed: f32 }

#[derive(Component)]
struct Velocity(Vec2);

fn move_player(
    mut query: Query<(&Player, &mut Transform, &Velocity)>
) {
    for (player, mut transform, velocity) in &mut query {
        transform.translation.x += velocity.0.x * player.speed;
        transform.translation.y += velocity.0.y * player.speed;
    }
}

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_systems(Update, move_player)
        .run();
}
\`\`\``,
  },
  {
    id: "t6",
    title: "LÖVE2D Game Loop",
    engineId: "love2d",
    skillLevel: "Beginner",
    duration: "30 min",
    views: "7.8k",
    author: "LuaLover",
    description: "Understand LÖVE's game loop and draw basic shapes.",
    tags: ["basics", "lua", "gameloop"],
    content: `# LÖVE2D Game Loop

LÖVE uses three main callbacks. Here\'s the full game loop structure:

\`\`\`lua
-- main.lua
local player = { x = 100, y = 100, speed = 200 }

function love.load()
    love.window.setTitle("My LÖVE Game")
end

function love.update(dt)
    if love.keyboard.isDown("right") then
        player.x = player.x + player.speed * dt
    end
    if love.keyboard.isDown("left") then
        player.x = player.x - player.speed * dt
    end
end

function love.draw()
    love.graphics.setColor(0.2, 0.6, 1)
    love.graphics.rectangle("fill", player.x, player.y, 40, 40)
end
\`\`\``,
  },
  {
    id: "t7",
    title: "Advanced Shaders in O3DE",
    engineId: "o3de",
    skillLevel: "Advanced",
    duration: "90 min",
    views: "2.1k",
    author: "ShaderWizard",
    description: "Write custom AZSL shaders for the Atom renderer.",
    tags: ["shaders", "graphics", "azsl"],
    content: `# Advanced Shaders in O3DE

O3DE uses AZSL (Amazon Shading Language), an extension of HLSL.

\`\`\`hlsl
// custom.azsl
#include <Atom/Features/SrgSemantics.azsli>

ShaderResourceGroup ObjectSrg : SRG_PerObject
{
    float4x4 m_worldMatrix;
    float4 m_color;
}

struct VertexInput { float3 m_position : POSITION; }
struct VertexOutput { float4 m_position : SV_Position; }

VertexOutput MainVS(VertexInput IN)
{
    VertexOutput OUT;
    OUT.m_position = mul(ObjectSrg::m_worldMatrix, float4(IN.m_position, 1.0));
    return OUT;
}

float4 MainPS(VertexOutput IN) : SV_Target0
{
    return ObjectSrg::m_color;
}
\`\`\``,
  },
  {
    id: "t8",
    title: "Multiplayer with Godot",
    engineId: "godot",
    skillLevel: "Advanced",
    duration: "120 min",
    views: "6.7k",
    author: "NetcodePro",
    description:
      "Build real-time multiplayer games using Godot's high-level networking API.",
    tags: ["multiplayer", "networking", "rpc"],
    content: `# Multiplayer with Godot

Godot 4 includes a powerful high-level multiplayer API.

\`\`\`gdscript
extends Node

func _ready():
    multiplayer.peer_connected.connect(_on_peer_connected)
    multiplayer.peer_disconnected.connect(_on_peer_disconnected)

func host_game():
    var peer = ENetMultiplayerPeer.new()
    peer.create_server(7777, 4)
    multiplayer.multiplayer_peer = peer

func join_game(ip: String):
    var peer = ENetMultiplayerPeer.new()
    peer.create_client(ip, 7777)
    multiplayer.multiplayer_peer = peer

@rpc("any_peer", "call_local")
func sync_position(player_id: int, pos: Vector2):
    $Players.get_node(str(player_id)).position = pos
\`\`\``,
  },
];

const CHANNELS: Channel[] = [
  {
    id: "general",
    name: "general",
    emoji: "💬",
    description: "General game development discussion",
    postCount: 142,
  },
  {
    id: "godot",
    name: "godot",
    emoji: "🎮",
    description: "Everything Godot Engine",
    postCount: 89,
  },
  {
    id: "o3de",
    name: "o3de",
    emoji: "🔷",
    description: "Open 3D Engine discussion",
    postCount: 34,
  },
  {
    id: "defold",
    name: "defold",
    emoji: "🌀",
    description: "Defold game engine",
    postCount: 56,
  },
  {
    id: "bevy",
    name: "bevy",
    emoji: "🦀",
    description: "Bevy ECS engine in Rust",
    postCount: 67,
  },
  {
    id: "love2d",
    name: "love2d",
    emoji: "💚",
    description: "LÖVE2D framework",
    postCount: 45,
  },
  {
    id: "showcase",
    name: "showcase",
    emoji: "🌟",
    description: "Show off your projects",
    postCount: 23,
  },
  {
    id: "help",
    name: "help",
    emoji: "🆘",
    description: "Get help from the community",
    postCount: 112,
  },
];

const POSTS: Post[] = [
  {
    id: "p1",
    channelId: "general",
    title: "Which royalty-free engine should I pick for my first game?",
    content:
      "I'm a beginner developer looking to make a simple 2D RPG. I've been researching engines and I'm torn between Godot and LÖVE2D. Godot seems more complete but LÖVE seems simpler. Any advice?",
    author: "newdev_alex",
    replyCount: 14,
    views: 892,
    tags: ["beginner", "help"],
    time: "2h ago",
    replies: [
      {
        id: "r1",
        author: "GodotGuru",
        content:
          "For a 2D RPG, Godot is the clear winner. It has a built-in tilemap editor, a robust animation system, and a huge community. The learning curve is gentle and the docs are excellent.",
        time: "1h ago",
      },
      {
        id: "r2",
        author: "LuaLover",
        content:
          "LÖVE is great for learning game dev fundamentals since you build everything yourself, but Godot will get you to a finished product faster. Go with Godot!",
        time: "45min ago",
      },
    ],
  },
  {
    id: "p2",
    channelId: "general",
    title: "Open source game development resources thread",
    content:
      "Compiling a list of free resources for game development. Assets, tools, tutorials — post your favorites below! Zero-cost game dev is 100% viable in 2024.",
    author: "opensourcehero",
    replyCount: 31,
    views: 2341,
    tags: ["resources", "foss"],
    time: "1d ago",
    replies: [
      {
        id: "r3",
        author: "AssetHunter",
        content:
          "OpenGameArt.org is a goldmine. Thousands of free sprites, music, and sound effects all under Creative Commons.",
        time: "23h ago",
      },
    ],
  },
  {
    id: "p3",
    channelId: "godot",
    title: "GDScript vs C# — what do you use?",
    content:
      "Curious what the community prefers. I started with GDScript but considering switching to C# for better tooling. Is the performance difference noticeable for indie games?",
    author: "script_curious",
    replyCount: 22,
    views: 1567,
    tags: ["gdscript", "csharp"],
    time: "3h ago",
    replies: [
      {
        id: "r4",
        author: "IndieDevPro",
        content:
          "GDScript for rapid prototyping, C# when you need performance or want IDE support. For most indie games, GDScript is perfectly fine.",
        time: "2h ago",
      },
    ],
  },
  {
    id: "p4",
    channelId: "godot",
    title: "Godot 4 vs Godot 3 — migration tips",
    content:
      "I'm migrating my Godot 3 project to Godot 4. The GDScript changes are significant. Has anyone done this successfully? Any gotchas to watch out for?",
    author: "migrating_dev",
    replyCount: 18,
    views: 1203,
    tags: ["migration", "godot4"],
    time: "5h ago",
    replies: [],
  },
  {
    id: "p5",
    channelId: "bevy",
    title: "ECS clicked for me today — sharing my experience",
    content:
      "After struggling with OOP game architecture for months, Bevy's ECS finally made sense. The separation of data (Components) and behavior (Systems) is so clean. Here's what helped me...",
    author: "RustGameDev",
    replyCount: 9,
    views: 743,
    tags: ["ecs", "architecture"],
    time: "6h ago",
    replies: [],
  },
  {
    id: "p6",
    channelId: "help",
    title: "Godot: CharacterBody2D not detecting floor",
    content:
      "My player keeps falling through platforms. I've set up collision shapes on both the player and the floor, but is_on_floor() always returns false. Platform uses StaticBody2D.",
    author: "stuck_dev",
    replyCount: 7,
    views: 445,
    tags: ["godot", "physics", "bug"],
    time: "1h ago",
    replies: [
      {
        id: "r5",
        author: "GodotGuru",
        content:
          "Make sure you're calling move_and_slide() BEFORE checking is_on_floor(). The floor detection is updated by move_and_slide.",
        time: "30min ago",
      },
    ],
  },
  {
    id: "p7",
    channelId: "showcase",
    title: "Released my first Godot game — it's free!",
    content:
      "After 6 months of development, I shipped my first game! It's a puzzle platformer built entirely in Godot 4. Zero royalties, zero licensing fees — open source forever. Download link inside!",
    author: "first_ship",
    replyCount: 41,
    views: 3210,
    tags: ["release", "godot", "platformer"],
    time: "2d ago",
    replies: [],
  },
  {
    id: "p8",
    channelId: "love2d",
    title: "LÖVE physics with Box2D — joint examples",
    content:
      "Sharing some examples of physics joints in LÖVE. Rope joints, revolute joints, distance constraints — all using the built-in Box2D integration.",
    author: "PhysicsFan",
    replyCount: 6,
    views: 389,
    tags: ["physics", "box2d", "lua"],
    time: "4h ago",
    replies: [],
  },
];

const SAMPLE_ASSETS: SampleAsset[] = [
  {
    id: "sa1",
    name: "Pixel Character Pack",
    description: "16x16 pixel art characters with walk/run/jump animations",
    category: "sprites",
    engineTags: ["Godot", "Defold"],
    fileSize: "2.4 MB",
    downloadCount: 1200,
    emoji: "🧑‍🎨",
  },
  {
    id: "sa2",
    name: "Forest Ambience SFX",
    description: "High-quality ambient sound effects for forest environments",
    category: "audio",
    engineTags: ["All Engines"],
    fileSize: "8.1 MB",
    downloadCount: 876,
    emoji: "🎵",
  },
  {
    id: "sa3",
    name: "Low Poly Trees Pack",
    description: "50+ low polygon tree models with LOD variants",
    category: "models",
    engineTags: ["O3DE", "Armory3D"],
    fileSize: "12.3 MB",
    downloadCount: 654,
    emoji: "🌲",
  },
  {
    id: "sa4",
    name: "Cel Shading Shader",
    description: "Toon/cel shading effect with outline support",
    category: "shaders",
    engineTags: ["Godot", "Bevy"],
    fileSize: "45 KB",
    downloadCount: 2100,
    emoji: "✨",
  },
  {
    id: "sa5",
    name: "RPG Dungeon Tileset",
    description: "32x32 dungeon tileset with walls, floors, and props",
    category: "tilemaps",
    engineTags: ["Godot", "Defold"],
    fileSize: "3.7 MB",
    downloadCount: 1800,
    emoji: "🗺️",
  },
  {
    id: "sa6",
    name: "Pixel UI Font Pack",
    description: "8 pixel-perfect fonts for game UIs, 3 sizes each",
    category: "fonts",
    engineTags: ["All Engines"],
    fileSize: "890 KB",
    downloadCount: 3200,
    emoji: "🔤",
  },
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "proj1",
    name: "Space Shooter Demo",
    description: "A classic top-down space shooter built in Godot 4",
    engine: "Godot",
    status: "active",
    progress: 40,
    tasks: [
      {
        id: "task1",
        title: "Player movement & shooting",
        description: "Implement CharacterBody2D with bullet spawning",
        status: "done",
        priority: "high",
      },
      {
        id: "task2",
        title: "Enemy AI patterns",
        description: "Create 3 enemy types with different movement patterns",
        status: "in-progress",
        priority: "high",
      },
      {
        id: "task3",
        title: "Score & UI system",
        description:
          "Implement score counter, lives display, and game over screen",
        status: "in-progress",
        priority: "medium",
      },
      {
        id: "task4",
        title: "Sound effects & music",
        description: "Add SFX for shooting, explosions, and background music",
        status: "todo",
        priority: "low",
      },
      {
        id: "task5",
        title: "Power-up system",
        description: "Implement shield, rapid-fire, and bomb power-ups",
        status: "todo",
        priority: "medium",
      },
      {
        id: "task6",
        title: "Level progression",
        description: "Add 5 levels with increasing difficulty",
        status: "todo",
        priority: "medium",
      },
    ],
    milestones: [
      {
        id: "ms1",
        title: "Core gameplay loop complete",
        dueDate: "2024-02-15",
        completed: true,
      },
      {
        id: "ms2",
        title: "All enemies implemented",
        dueDate: "2024-03-01",
        completed: false,
      },
      {
        id: "ms3",
        title: "Full alpha release",
        dueDate: "2024-03-30",
        completed: false,
      },
    ],
  },
];

// ─── Color Constants ──────────────────────────────────────────────────────────
const C = {
  bg: "#0B0F16",
  bgCard: "#141B2A",
  bgSurface: "#0F172A",
  border: "#242B3A",
  textPrimary: "#E5E7EB",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
  accent: "#8B5CF6",
  accentHover: "#7C3AED",
  green: "#22C55E",
  greenBg: "#0F2A1A",
};

// ─── Small Helper Components ──────────────────────────────────────────────────
function Badge({
  color,
  bg,
  children,
}: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <span
      style={{ color, backgroundColor: bg, border: `1px solid ${color}30` }}
      className="text-xs px-2 py-0.5 rounded-full font-medium"
    >
      {children}
    </span>
  );
}

function SkillBadge({ level }: { level: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    Beginner: { color: "#22C55E", bg: "#0F2A1A" },
    Intermediate: { color: "#F59E0B", bg: "#2A1F0A" },
    Advanced: { color: "#EF4444", bg: "#2A0F0F" },
  };
  const s = map[level] ?? { color: C.textSecondary, bg: C.bgCard };
  return (
    <Badge color={s.color} bg={s.bg}>
      {level}
    </Badge>
  );
}

function EngineBadge({ engineId }: { engineId: string }) {
  const e = ENGINES.find((x) => x.id === engineId);
  return (
    <Badge color={C.accent} bg={`${C.accent}20`}>
      {e ? `${e.emoji} ${e.name}` : engineId}
    </Badge>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    sprites: "#8B5CF6",
    audio: "#06B6D4",
    models: "#F59E0B",
    shaders: "#22C55E",
    tilemaps: "#EF4444",
    fonts: "#EC4899",
  };
  const c = colors[cat] ?? C.textSecondary;
  return (
    <Badge color={c} bg={`${c}20`}>
      {cat}
    </Badge>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [section, setSection] = useState<Section>("dashboard");
  const { identity, login, clear } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const { actor } = useActor();

  return (
    <div
      style={{
        backgroundColor: C.bg,
        color: C.textPrimary,
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
      className="flex flex-col"
    >
      <Header
        section={section}
        setSection={setSection}
        isAuthenticated={isAuthenticated}
        login={login}
        logout={clear}
      />
      <div className="flex" style={{ paddingTop: 64 }}>
        <Sidebar section={section} setSection={setSection} />
        <main
          style={{
            marginLeft: 240,
            flex: 1,
            minHeight: "calc(100vh - 64px)",
            overflowY: "auto",
          }}
        >
          {section === "dashboard" && (
            <DashboardSection setSection={setSection} />
          )}
          {section === "engines" && <EnginesSection />}
          {section === "tutorials" && <TutorialsSection />}
          {section === "assets" && (
            <AssetsSection actor={actor} isAuthenticated={isAuthenticated} />
          )}
          {section === "community" && <CommunitySection />}
          {section === "projects" && <ProjectsSection />}
        </main>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({
  section,
  setSection,
  isAuthenticated,
  login,
  logout,
}: {
  section: Section;
  setSection: (s: Section) => void;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}) {
  const navLinks: { id: Section; label: string }[] = [
    { id: "engines", label: "Engines" },
    { id: "tutorials", label: "Tutorials" },
    { id: "assets", label: "Assets" },
    { id: "community", label: "Community" },
    { id: "projects", label: "Projects" },
  ];
  return (
    <header
      style={{
        backgroundColor: C.bgSurface,
        borderBottom: `1px solid ${C.border}`,
        height: 64,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}
      className="flex items-center px-6 gap-6"
    >
      <button
        type="button"
        onClick={() => setSection("dashboard")}
        className="flex items-center gap-2 flex-shrink-0"
      >
        <span className="text-2xl">⚙️</span>
        <div className="leading-tight">
          <div
            style={{
              color: C.accent,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.15em",
            }}
          >
            ROYALTY-FREE
          </div>
          <div
            style={{
              color: C.textPrimary,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            GAME ENGINE HUB
          </div>
        </div>
      </button>
      <nav className="flex items-center gap-1 flex-1">
        {navLinks.map((l) => (
          <button
            type="button"
            key={l.id}
            onClick={() => setSection(l.id)}
            style={{
              color: section === l.id ? C.textPrimary : C.textSecondary,
              backgroundColor:
                section === l.id ? `${C.accent}20` : "transparent",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
            }}
            className="transition-colors hover:text-white"
          >
            {l.label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <span style={{ color: C.textMuted, fontSize: 13 }}>🔍 Search</span>
        {isAuthenticated ? (
          <button
            type="button"
            onClick={logout}
            style={{ color: C.textSecondary, fontSize: 13, fontWeight: 500 }}
            className="hover:text-white"
          >
            Logout
          </button>
        ) : (
          <button
            type="button"
            onClick={login}
            style={{
              backgroundColor: C.accent,
              color: "#fff",
              padding: "6px 16px",
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
            }}
            className="hover:opacity-90 transition-opacity"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  section,
  setSection,
}: { section: Section; setSection: (s: Section) => void }) {
  const items: { id: Section; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "engines", label: "Engine Discovery", icon: "🎮" },
    { id: "tutorials", label: "Tutorials", icon: "📚" },
    { id: "assets", label: "Asset Library", icon: "📦" },
    { id: "community", label: "Community", icon: "💬" },
    { id: "projects", label: "My Projects", icon: "🗂️" },
  ];
  return (
    <aside
      style={{
        width: 240,
        backgroundColor: C.bgSurface,
        borderRight: `1px solid ${C.border}`,
        position: "fixed",
        top: 64,
        bottom: 0,
        overflowY: "auto",
      }}
      className="flex flex-col py-4 px-3"
    >
      <div
        style={{
          color: C.textMuted,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          padding: "0 8px 8px",
        }}
      >
        NAVIGATION
      </div>
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => setSection(item.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 8,
            backgroundColor:
              section === item.id ? `${C.accent}25` : "transparent",
            color: section === item.id ? C.textPrimary : C.textSecondary,
            fontSize: 14,
            fontWeight: section === item.id ? 600 : 400,
            marginBottom: 2,
            width: "100%",
            textAlign: "left",
          }}
          className="transition-colors hover:text-white"
        >
          <span>{item.icon}</span>
          {item.label}
          {section === item.id && (
            <span
              style={{
                marginLeft: "auto",
                width: 3,
                height: 16,
                backgroundColor: C.accent,
                borderRadius: 2,
              }}
            />
          )}
        </button>
      ))}
      <div
        style={{
          marginTop: "auto",
          padding: "16px 8px 0",
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <div style={{ color: C.textMuted, fontSize: 11 }}>
          v1.0.0 · MIT Licensed
        </div>
        <div style={{ color: C.green, fontSize: 11, fontFamily: "monospace" }}>
          ● Open Source
        </div>
      </div>
    </aside>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardSection({
  setSection,
}: { setSection: (s: Section) => void }) {
  return (
    <div className="p-8">
      {/* Hero */}
      <div className="text-center py-16">
        <div
          style={{
            display: "inline-block",
            backgroundColor: `${C.green}20`,
            color: C.green,
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: 9999,
            marginBottom: 24,
            letterSpacing: "0.1em",
          }}
        >
          100% FREE · ZERO ROYALTIES · OPEN SOURCE
        </div>
        <h1
          style={{
            fontSize: 52,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          <span style={{ color: C.textPrimary }}>Build Without Limits.</span>
          <br />
          <span style={{ color: C.accent }}>Ship Without Royalties.</span>
        </h1>
        <p
          style={{
            color: C.textSecondary,
            fontSize: 18,
            maxWidth: 560,
            margin: "0 auto 32px",
            lineHeight: 1.6,
          }}
        >
          Discover royalty-free game engines, learn from community tutorials,
          share assets, and build your games — all at zero licensing cost.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setSection("engines")}
            style={{
              backgroundColor: C.accent,
              color: "#fff",
              padding: "12px 28px",
              borderRadius: 9999,
              fontWeight: 600,
              fontSize: 15,
              boxShadow: `0 0 20px ${C.accent}40`,
            }}
            className="hover:opacity-90 transition-opacity"
          >
            🎮 Explore Engines
          </button>
          <button
            type="button"
            onClick={() => setSection("assets")}
            style={{
              backgroundColor: "transparent",
              color: C.textPrimary,
              padding: "12px 28px",
              borderRadius: 9999,
              fontWeight: 600,
              fontSize: 15,
              border: `1px solid ${C.border}`,
            }}
            className="hover:border-purple-500 transition-colors"
          >
            📦 Browse Assets
          </button>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-12">
        {[
          { label: "Free Engines", value: "6", icon: "🎮" },
          { label: "Tutorials", value: "50+", icon: "📚" },
          { label: "Free Assets", value: "200+", icon: "📦" },
          { label: "Community", value: "Active", icon: "💬" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              backgroundColor: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: C.accent,
                marginBottom: 4,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: C.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Featured Engines Preview */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Featured Engines</h2>
          <button
            type="button"
            onClick={() => setSection("engines")}
            style={{ color: C.accent, fontSize: 13 }}
            className="hover:underline"
          >
            See all →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {ENGINES.slice(0, 3).map((e) => (
            <div
              key={e.id}
              style={{
                backgroundColor: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: 24 }}>{e.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>
                    v{e.version}
                  </div>
                </div>
              </div>
              <Badge color={C.green} bg={C.greenBg}>
                Open Source
              </Badge>
              <span style={{ marginLeft: 6 }}>
                <Badge color={C.textSecondary} bg={`${C.bgSurface}`}>
                  {e.license}
                </Badge>
              </span>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>
                {e.features.slice(0, 2).join(" · ")}
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Recent Tutorials */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Recent Tutorials</h2>
          <button
            type="button"
            onClick={() => setSection("tutorials")}
            style={{ color: C.accent, fontSize: 13 }}
            className="hover:underline"
          >
            See all →
          </button>
        </div>
        <div
          style={{
            backgroundColor: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {TUTORIALS.slice(0, 4).map((t, i) => (
            <div
              key={t.id}
              style={{
                padding: "14px 16px",
                borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <EngineBadge engineId={t.engineId} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
                {t.title}
              </span>
              <SkillBadge level={t.skillLevel} />
              <span style={{ fontSize: 12, color: C.textMuted }}>
                {t.duration}
              </span>
            </div>
          ))}
          <div
            style={{
              padding: "10px 16px",
              backgroundColor: `${C.bgSurface}80`,
            }}
          >
            <span
              style={{ fontFamily: "monospace", fontSize: 12, color: C.green }}
            >
              ~/gamedev/tutorials $ ls -la
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Engines Section ──────────────────────────────────────────────────────────
function EnginesSection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "All" | "2D" | "3D" | "Both" | "Framework"
  >("All");
  const [selected, setSelected] = useState<Engine | null>(null);

  const filtered = ENGINES.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || e.category === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          Engine Discovery
        </h1>
        <p style={{ color: C.textSecondary, fontSize: 14 }}>
          Explore royalty-free game engines — build anything, pay nothing.
        </p>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search engines..."
          style={{
            flex: 1,
            backgroundColor: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "10px 14px",
            color: C.textPrimary,
            fontSize: 14,
            outline: "none",
          }}
        />
        <div className="flex gap-2">
          {(["All", "2D", "3D", "Both", "Framework"] as const).map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 14px",
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 500,
                backgroundColor: filter === f ? C.accent : C.bgCard,
                color: filter === f ? "#fff" : C.textSecondary,
                border: `1px solid ${filter === f ? C.accent : C.border}`,
              }}
              className="transition-all"
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {selected ? (
        <EngineDetail engine={selected} onClose={() => setSelected(null)} />
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {filtered.map((e) => (
            <EngineCard key={e.id} engine={e} onClick={() => setSelected(e)} />
          ))}
        </div>
      )}
    </div>
  );
}

function EngineCard({
  engine: e,
  onClick,
}: { engine: Engine; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        backgroundColor: C.bgCard,
        border: `1px solid ${hover ? C.accent : C.border}`,
        borderRadius: 16,
        padding: 20,
        cursor: "pointer",
        transition: "border-color 0.2s",
        boxShadow: hover ? `0 0 16px ${C.accent}20` : "none",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 32 }}>{e.emoji}</span>
          <div>
            <div
              style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.03em" }}
            >
              {e.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted }}>v{e.version}</div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: C.textMuted }}>
          ★ {(e.stars / 1000).toFixed(1)}k
        </span>
      </div>
      <div className="flex gap-2 flex-wrap mb-3">
        <Badge color={C.green} bg={C.greenBg}>
          Open Source
        </Badge>
        <Badge color={C.textSecondary} bg={C.bgSurface}>
          {e.license}
        </Badge>
        <Badge color="#60A5FA" bg="#1E3A5F">
          {e.category}
        </Badge>
      </div>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>
        <span style={{ fontWeight: 600, color: C.textSecondary }}>
          Platforms:{" "}
        </span>
        {e.platforms.join(", ")}
      </div>
      <ul style={{ margin: "0 0 12px", padding: 0, listStyle: "none" }}>
        {e.features.slice(0, 4).map((f) => (
          <li
            key={f}
            style={{ fontSize: 12, color: C.textSecondary, padding: "2px 0" }}
          >
            • {f}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-1">
        {e.tags.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 11,
              color: C.textMuted,
              backgroundColor: `${C.bgSurface}`,
              border: `1px solid ${C.border}`,
              padding: "2px 8px",
              borderRadius: 9999,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </button>
  );
}

function EngineDetail({
  engine: e,
  onClose,
}: { engine: Engine; onClose: () => void }) {
  return (
    <div
      style={{
        backgroundColor: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 32,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}
        className="hover:text-white"
      >
        ← Back to all engines
      </button>
      <div className="flex items-center gap-4 mb-6">
        <span style={{ fontSize: 48 }}>{e.emoji}</span>
        <div>
          <h2 style={{ fontSize: 32, fontWeight: 800 }}>{e.name}</h2>
          <div className="flex gap-2 mt-1">
            <Badge color={C.green} bg={C.greenBg}>
              Open Source
            </Badge>
            <Badge color={C.textSecondary} bg={C.bgSurface}>
              {e.license}
            </Badge>
            <Badge color="#60A5FA" bg="#1E3A5F">
              {e.category}
            </Badge>
          </div>
        </div>
      </div>
      <p style={{ color: C.textSecondary, lineHeight: 1.7, marginBottom: 24 }}>
        {e.description}
      </p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 12, color: C.accent }}>
            Features
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {e.features.map((f) => (
              <li
                key={f}
                style={{
                  color: C.textSecondary,
                  fontSize: 14,
                  padding: "4px 0",
                }}
              >
                ✓ {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 12, color: C.accent }}>
            Platforms
          </h3>
          <div className="flex flex-wrap gap-2">
            {e.platforms.map((p) => (
              <Badge key={p} color={C.textSecondary} bg={C.bgSurface}>
                {p}
              </Badge>
            ))}
          </div>
          <h3
            style={{ fontWeight: 700, margin: "20px 0 12px", color: C.accent }}
          >
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {e.tags.map((t) => (
              <Badge key={t} color={C.textMuted} bg={C.bgSurface}>
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 24,
          paddingTop: 24,
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <a
          href={e.website}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: C.accent,
            color: "#fff",
            padding: "10px 24px",
            borderRadius: 9999,
            fontWeight: 600,
            fontSize: 14,
            display: "inline-block",
          }}
          className="hover:opacity-90 transition-opacity"
        >
          Visit {e.name} Website →
        </a>
      </div>
    </div>
  );
}

// ─── Tutorials Section ────────────────────────────────────────────────────────
function TutorialsSection() {
  const [engineFilter, setEngineFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("All");
  const [selected, setSelected] = useState<Tutorial | null>(TUTORIALS[0]);

  const filtered = TUTORIALS.filter((t) => {
    const matchEngine = engineFilter === "all" || t.engineId === engineFilter;
    const matchLevel = levelFilter === "All" || t.skillLevel === levelFilter;
    return matchEngine && matchLevel;
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          Tutorials & Docs
        </h1>
        <p style={{ color: C.textSecondary, fontSize: 14 }}>
          Community guides organized by engine and skill level.
        </p>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <select
          value={engineFilter}
          onChange={(e) => setEngineFilter(e.target.value)}
          style={{
            backgroundColor: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "8px 12px",
            color: C.textPrimary,
            fontSize: 13,
          }}
        >
          <option value="all">All Engines</option>
          {ENGINES.map((e) => (
            <option key={e.id} value={e.id}>
              {e.emoji} {e.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          {["All", "Beginner", "Intermediate", "Advanced"].map((l) => (
            <button
              type="button"
              key={l}
              onClick={() => setLevelFilter(l)}
              style={{
                padding: "7px 14px",
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 500,
                backgroundColor: levelFilter === l ? C.accent : C.bgCard,
                color: levelFilter === l ? "#fff" : C.textSecondary,
                border: `1px solid ${levelFilter === l ? C.accent : C.border}`,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {/* Tutorial list */}
        <div
          style={{
            backgroundColor: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {filtered.map((t, i) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setSelected(t)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 16px",
                borderBottom:
                  i < filtered.length - 1 ? `1px solid ${C.border}` : "none",
                backgroundColor:
                  selected?.id === t.id ? `${C.accent}15` : "transparent",
                borderLeft:
                  selected?.id === t.id
                    ? `3px solid ${C.accent}`
                    : "3px solid transparent",
              }}
              className="transition-colors hover:bg-white/5"
            >
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                {t.title}
              </div>
              <div className="flex items-center gap-2">
                <EngineBadge engineId={t.engineId} />
                <SkillBadge level={t.skillLevel} />
                <span style={{ fontSize: 11, color: C.textMuted }}>
                  ⏱ {t.duration}
                </span>
                <span style={{ fontSize: 11, color: C.textMuted }}>
                  👁 {t.views}
                </span>
              </div>
            </button>
          ))}
          <div
            style={{
              padding: "10px 16px",
              backgroundColor: `${C.bgSurface}80`,
            }}
          >
            <span
              style={{ fontFamily: "monospace", fontSize: 12, color: C.green }}
            >
              ~/gamedev/tutorials $ ls -la
            </span>
          </div>
        </div>
        {/* Tutorial detail */}
        {selected && (
          <div
            style={{
              backgroundColor: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 24,
              overflow: "auto",
              maxHeight: 600,
            }}
          >
            <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              {selected.title}
            </h2>
            <div className="flex gap-2 mb-4">
              <EngineBadge engineId={selected.engineId} />
              <SkillBadge level={selected.skillLevel} />
              <span style={{ fontSize: 12, color: C.textMuted }}>
                ⏱ {selected.duration} · 👁 {selected.views} views
              </span>
            </div>
            <p
              style={{ color: C.textSecondary, fontSize: 14, marginBottom: 16 }}
            >
              {selected.description}
            </p>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                color: C.textPrimary,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {selected.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Assets Section ───────────────────────────────────────────────────────────
function AssetsSection({
  actor,
  isAuthenticated,
}: {
  actor: {
    getAllAssets: () => Promise<Asset[]>;
    createAsset: (
      n: string,
      d: string,
      c: AssetCategory,
      t: string[],
      u: string,
      s: string,
      p: string,
      b: string | null,
    ) => Promise<bigint>;
    incrementAssetDownloadCount: (id: bigint) => Promise<void>;
  } | null;
  isAuthenticated: boolean;
}) {
  const [catFilter, setCatFilter] = useState("all");
  const [backendAssets, setBackendAssets] = useState<Asset[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    category: AssetCategory.sprites,
    engineTags: "",
    fileSize: "1 MB",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (actor) {
      actor
        .getAllAssets()
        .then(setBackendAssets)
        .catch(() => {});
    }
  }, [actor]);

  const handleDownload = useCallback(
    async (id: string, isBackend: boolean) => {
      if (isBackend && actor) {
        try {
          await actor.incrementAssetDownloadCount(BigInt(id));
        } catch {}
      }
    },
    [actor],
  );

  const handleUpload = useCallback(async () => {
    if (!actor || !isAuthenticated) return;
    setUploading(true);
    try {
      await actor.createAsset(
        uploadForm.name,
        uploadForm.description,
        uploadForm.category,
        uploadForm.engineTags.split(",").map((s) => s.trim()),
        "Anonymous",
        uploadForm.fileSize,
        "",
        null,
      );
      const updated = await actor.getAllAssets();
      setBackendAssets(updated);
      setShowUpload(false);
      setUploadForm({
        name: "",
        description: "",
        category: AssetCategory.sprites,
        engineTags: "",
        fileSize: "1 MB",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  }, [actor, isAuthenticated, uploadForm]);

  const cats = [
    "all",
    "sprites",
    "audio",
    "models",
    "shaders",
    "tilemaps",
    "fonts",
  ];

  const sampleFiltered =
    catFilter === "all"
      ? SAMPLE_ASSETS
      : SAMPLE_ASSETS.filter((a) => a.category === catFilter);
  const backendFiltered =
    catFilter === "all"
      ? backendAssets
      : backendAssets.filter(
          (a) => a.category === (catFilter as unknown as AssetCategory),
        );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            Asset Library
          </h1>
          <p style={{ color: C.textSecondary, fontSize: 14 }}>
            Free game assets for everyone. Share and download with zero
            restrictions.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            isAuthenticated
              ? setShowUpload(true)
              : alert("Please login to upload assets")
          }
          style={{
            backgroundColor: C.accent,
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 9999,
            fontWeight: 600,
            fontSize: 14,
          }}
          className="hover:opacity-90 transition-opacity"
        >
          📤 Upload Asset
        </button>
      </div>
      <div className="flex gap-2 mb-6">
        {cats.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setCatFilter(c)}
            style={{
              padding: "7px 16px",
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 500,
              backgroundColor: catFilter === c ? C.accent : C.bgCard,
              color: catFilter === c ? "#fff" : C.textSecondary,
              border: `1px solid ${catFilter === c ? C.accent : C.border}`,
            }}
            className="capitalize"
          >
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        {sampleFiltered.map((a) => (
          <div
            key={a.id}
            style={{
              backgroundColor: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 100,
                backgroundColor: `${C.bgSurface}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
              }}
            >
              {a.emoji}
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                {a.name}
              </div>
              <p
                style={{
                  color: C.textSecondary,
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                {a.description}
              </p>
              <div className="flex gap-1 flex-wrap mb-3">
                <CategoryBadge cat={a.category} />
                {a.engineTags.map((t) => (
                  <Badge key={t} color={C.textMuted} bg={C.bgSurface}>
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 12, color: C.textMuted }}>
                  {a.fileSize} · ⬇ {a.downloadCount.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleDownload(a.id, false)}
                  style={{
                    backgroundColor: `${C.accent}20`,
                    color: C.accent,
                    padding: "5px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  className="hover:bg-purple-500/30 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
        {backendFiltered.map((a) => (
          <div
            key={a.id.toString()}
            style={{
              backgroundColor: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 100,
                backgroundColor: C.bgSurface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
              }}
            >
              📁
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                {a.name}
              </div>
              <p
                style={{
                  color: C.textSecondary,
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                {a.description}
              </p>
              <div className="flex gap-1 flex-wrap mb-3">
                <CategoryBadge cat={String(a.category)} />
                {a.engineTags.map((t) => (
                  <Badge key={t} color={C.textMuted} bg={C.bgSurface}>
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 12, color: C.textMuted }}>
                  {a.fileSize} · ⬇ {a.downloadCount.toString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleDownload(a.id.toString(), true)}
                  style={{
                    backgroundColor: `${C.accent}20`,
                    color: C.accent,
                    padding: "5px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  className="hover:bg-purple-500/30 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Upload Modal */}
      {showUpload && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 32,
              width: 480,
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
              Upload Asset
            </h3>
            {(
              [
                { label: "Name", key: "name", type: "text" },
                { label: "Description", key: "description", type: "text" },
                { label: "File Size", key: "fileSize", type: "text" },
                {
                  label: "Engine Tags (comma-separated)",
                  key: "engineTags",
                  type: "text",
                },
              ] as const
            ).map((f) => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label
                  htmlFor={f.key}
                  style={{
                    fontSize: 13,
                    color: C.textSecondary,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {f.label}
                </label>
                <input
                  id={f.key}
                  value={uploadForm[f.key]}
                  onChange={(e) =>
                    setUploadForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    backgroundColor: C.bgSurface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "9px 12px",
                    color: C.textPrimary,
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="asset-category"
                style={{
                  fontSize: 13,
                  color: C.textSecondary,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Category
              </label>
              <select
                id="asset-category"
                value={uploadForm.category}
                onChange={(e) =>
                  setUploadForm((p) => ({
                    ...p,
                    category: e.target.value as AssetCategory,
                  }))
                }
                style={{
                  width: "100%",
                  backgroundColor: C.bgSurface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "9px 12px",
                  color: C.textPrimary,
                  fontSize: 14,
                }}
              >
                {Object.values(AssetCategory).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  flex: 1,
                  backgroundColor: C.accent,
                  color: "#fff",
                  padding: "10px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  opacity: uploading ? 0.7 : 1,
                }}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                style={{
                  flex: 1,
                  backgroundColor: C.bgSurface,
                  color: C.textSecondary,
                  padding: "10px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  border: `1px solid ${C.border}`,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Community Section ────────────────────────────────────────────────────────
function CommunitySection() {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [replyText, setReplyText] = useState("");
  const [localPosts, setLocalPosts] = useState<Post[]>(POSTS);

  const channelPosts = localPosts.filter(
    (p) => p.channelId === activeChannel.id,
  );

  const handleReply = () => {
    if (!replyText.trim() || !activePost) return;
    const newReply: Reply = {
      id: Date.now().toString(),
      author: "You",
      content: replyText,
      time: "just now",
    };
    const updated = localPosts.map((p) =>
      p.id === activePost.id
        ? {
            ...p,
            replies: [...p.replies, newReply],
            replyCount: p.replyCount + 1,
          }
        : p,
    );
    setLocalPosts(updated);
    setActivePost(updated.find((p) => p.id === activePost.id) ?? null);
    setReplyText("");
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
      {/* Channel sidebar */}
      <div
        style={{
          width: 220,
          backgroundColor: C.bgSurface,
          borderRight: `1px solid ${C.border}`,
          padding: "24px 12px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            color: C.textMuted,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "0 8px 12px",
          }}
        >
          CHANNELS
        </div>
        {CHANNELS.map((ch) => (
          <button
            type="button"
            key={ch.id}
            onClick={() => {
              setActiveChannel(ch);
              setActivePost(null);
            }}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "8px 10px",
              borderRadius: 6,
              marginBottom: 2,
              backgroundColor:
                activeChannel.id === ch.id ? `${C.accent}20` : "transparent",
              color:
                activeChannel.id === ch.id ? C.textPrimary : C.textSecondary,
              fontSize: 14,
            }}
            className="transition-colors hover:text-white"
          >
            <span style={{ marginRight: 6 }}>{ch.emoji}</span>#{ch.name}
            <span style={{ float: "right", fontSize: 11, color: C.textMuted }}>
              {ch.postCount}
            </span>
          </button>
        ))}
      </div>
      {/* Thread list or detail */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {activePost ? (
          <div>
            <button
              type="button"
              onClick={() => setActivePost(null)}
              style={{ color: C.textMuted, fontSize: 13, marginBottom: 16 }}
              className="hover:text-white"
            >
              ← Back to #{activeChannel.name}
            </button>
            <div
              style={{
                backgroundColor: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 24,
                marginBottom: 16,
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                {activePost.title}
              </h2>
              <div
                style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}
              >
                by {activePost.author} · {activePost.time}
              </div>
              <p style={{ color: C.textSecondary, lineHeight: 1.7 }}>
                {activePost.content}
              </p>
              <div className="flex gap-2 mt-4">
                {activePost.tags.map((t) => (
                  <Badge key={t} color={C.textMuted} bg={C.bgSurface}>
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            {activePost.replies.map((r) => (
              <div
                key={r.id}
                style={{
                  backgroundColor: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: C.accent,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {r.author} · {r.time}
                </div>
                <p style={{ color: C.textSecondary, fontSize: 14 }}>
                  {r.content}
                </p>
              </div>
            ))}
            <div
              style={{
                backgroundColor: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: 16,
                marginTop: 16,
              }}
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                style={{
                  width: "100%",
                  backgroundColor: C.bgSurface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: 12,
                  color: C.textPrimary,
                  fontSize: 14,
                  resize: "vertical",
                  minHeight: 80,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={handleReply}
                style={{
                  marginTop: 10,
                  backgroundColor: C.accent,
                  color: "#fff",
                  padding: "8px 20px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                }}
                className="hover:opacity-90"
              >
                Reply
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                {activeChannel.emoji} #{activeChannel.name}
              </h2>
              <span style={{ fontSize: 13, color: C.textMuted }}>
                {activeChannel.description}
              </span>
            </div>
            {channelPosts.length === 0 ? (
              <div
                style={{
                  color: C.textMuted,
                  fontSize: 14,
                  textAlign: "center",
                  padding: 40,
                }}
              >
                No posts yet in this channel. Be the first!
              </div>
            ) : (
              channelPosts.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setActivePost(p)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    backgroundColor: C.bgCard,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 8,
                  }}
                  className="transition-colors hover:border-purple-500/50"
                >
                  <div
                    style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}
                  >
                    {p.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.textMuted,
                      marginBottom: 8,
                    }}
                  >
                    by {p.author} · {p.time}
                  </div>
                  <div className="flex items-center gap-4">
                    {p.tags.map((t) => (
                      <Badge key={t} color={C.textMuted} bg={C.bgSurface}>
                        {t}
                      </Badge>
                    ))}
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 12,
                        color: C.textMuted,
                      }}
                    >
                      💬 {p.replyCount} · 👁 {p.views}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Projects Section ─────────────────────────────────────────────────────────
function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const s = localStorage.getItem("rfgeh_projects");
      return s ? JSON.parse(s) : DEFAULT_PROJECTS;
    } catch {
      return DEFAULT_PROJECTS;
    }
  });
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    description: "",
    engine: "Godot",
    status: "active" as Project["status"],
  });
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
  });

  useEffect(() => {
    try {
      localStorage.setItem("rfgeh_projects", JSON.stringify(projects));
    } catch {}
  }, [projects]);

  const createProject = () => {
    if (!newForm.name.trim()) return;
    const proj: Project = {
      id: Date.now().toString(),
      ...newForm,
      progress: 0,
      tasks: [],
      milestones: [],
    };
    setProjects((p) => [...p, proj]);
    setShowNewProject(false);
    setNewForm({
      name: "",
      description: "",
      engine: "Godot",
      status: "active",
    });
  };

  const addTask = () => {
    if (!activeProject || !newTask.title.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      status: "todo",
    };
    const updated = projects.map((p) =>
      p.id === activeProject.id ? { ...p, tasks: [...p.tasks, task] } : p,
    );
    setProjects(updated);
    setActiveProject(updated.find((p) => p.id === activeProject.id) ?? null);
    setShowAddTask(false);
    setNewTask({ title: "", description: "", priority: "medium" });
  };

  const moveTask = (taskId: string, newStatus: Task["status"]) => {
    if (!activeProject) return;
    const updated = projects.map((p) =>
      p.id === activeProject.id
        ? {
            ...p,
            tasks: p.tasks.map((t) =>
              t.id === taskId ? { ...t, status: newStatus } : t,
            ),
          }
        : p,
    );
    setProjects(updated);
    setActiveProject(updated.find((p) => p.id === activeProject.id) ?? null);
  };

  const toggleMilestone = (msId: string) => {
    if (!activeProject) return;
    const updated = projects.map((p) =>
      p.id === activeProject.id
        ? {
            ...p,
            milestones: p.milestones.map((m) =>
              m.id === msId ? { ...m, completed: !m.completed } : m,
            ),
          }
        : p,
    );
    setProjects(updated);
    setActiveProject(updated.find((p) => p.id === activeProject.id) ?? null);
  };

  const statusColors: Record<Project["status"], { color: string; bg: string }> =
    {
      active: { color: C.green, bg: C.greenBg },
      completed: { color: "#60A5FA", bg: "#1E3A5F" },
      archived: { color: C.textMuted, bg: C.bgSurface },
    };

  const prioColors: Record<Task["priority"], string> = {
    high: "#EF4444",
    medium: "#F59E0B",
    low: "#22C55E",
  };

  return (
    <div className="p-8">
      {activeProject ? (
        <div>
          <button
            type="button"
            onClick={() => setActiveProject(null)}
            style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}
            className="hover:text-white"
          >
            ← Back to projects
          </button>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                {activeProject.name}
              </h1>
              <div className="flex gap-2 items-center">
                <Badge
                  color={statusColors[activeProject.status].color}
                  bg={statusColors[activeProject.status].bg}
                >
                  {activeProject.status}
                </Badge>
                <span style={{ fontSize: 13, color: C.textMuted }}>
                  {activeProject.engine}
                </span>
                <span style={{ fontSize: 13, color: C.textMuted }}>
                  Progress: {activeProject.progress}%
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTask(true)}
              style={{
                backgroundColor: C.accent,
                color: "#fff",
                padding: "8px 18px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
              }}
              className="hover:opacity-90"
            >
              + Add Task
            </button>
          </div>
          {/* Kanban */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            {(["todo", "in-progress", "done"] as const).map((col) => (
              <div
                key={col}
                style={{
                  backgroundColor: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color:
                      col === "todo"
                        ? C.textMuted
                        : col === "in-progress"
                          ? "#F59E0B"
                          : C.green,
                  }}
                >
                  {col === "todo"
                    ? "📋 To Do"
                    : col === "in-progress"
                      ? "⚡ In Progress"
                      : "✅ Done"}
                  <span
                    style={{ marginLeft: 8, fontSize: 12, color: C.textMuted }}
                  >
                    (
                    {activeProject.tasks.filter((t) => t.status === col).length}
                    )
                  </span>
                </div>
                {activeProject.tasks
                  .filter((t) => t.status === col)
                  .map((task) => (
                    <div
                      key={task.id}
                      style={{
                        backgroundColor: C.bgSurface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          marginBottom: 4,
                        }}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div
                          style={{
                            fontSize: 11,
                            color: C.textMuted,
                            marginBottom: 8,
                          }}
                        >
                          {task.description}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge
                          color={prioColors[task.priority]}
                          bg={`${prioColors[task.priority]}20`}
                        >
                          {task.priority}
                        </Badge>
                        <div className="flex gap-1">
                          {col !== "todo" && (
                            <button
                              type="button"
                              onClick={() =>
                                moveTask(
                                  task.id,
                                  col === "in-progress"
                                    ? "todo"
                                    : "in-progress",
                                )
                              }
                              style={{
                                fontSize: 11,
                                color: C.textMuted,
                                padding: "2px 6px",
                                borderRadius: 4,
                                border: `1px solid ${C.border}`,
                              }}
                            >
                              ←
                            </button>
                          )}
                          {col !== "done" && (
                            <button
                              type="button"
                              onClick={() =>
                                moveTask(
                                  task.id,
                                  col === "todo" ? "in-progress" : "done",
                                )
                              }
                              style={{
                                fontSize: 11,
                                color: C.accent,
                                padding: "2px 6px",
                                borderRadius: 4,
                                border: `1px solid ${C.accent}`,
                              }}
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
          {/* Milestones */}
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
            Milestones
          </h3>
          <div
            style={{
              backgroundColor: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {activeProject.milestones.map((m, i) => (
              <div
                key={m.id}
                style={{
                  padding: "14px 16px",
                  borderBottom:
                    i < activeProject.milestones.length - 1
                      ? `1px solid ${C.border}`
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <input
                  type="checkbox"
                  checked={m.completed}
                  onChange={() => toggleMilestone(m.id)}
                  style={{ accentColor: C.accent, width: 16, height: 16 }}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    textDecoration: m.completed ? "line-through" : "none",
                    color: m.completed ? C.textMuted : C.textPrimary,
                  }}
                >
                  {m.title}
                </span>
                <span style={{ fontSize: 12, color: C.textMuted }}>
                  Due: {m.dueDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                My Projects
              </h1>
              <p style={{ color: C.textSecondary, fontSize: 14 }}>
                Track your game development projects and tasks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewProject(true)}
              style={{
                backgroundColor: C.accent,
                color: "#fff",
                padding: "10px 20px",
                borderRadius: 9999,
                fontWeight: 600,
                fontSize: 14,
              }}
              className="hover:opacity-90"
            >
              + New Project
            </button>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {projects.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setActiveProject(p)}
                style={{
                  textAlign: "left",
                  backgroundColor: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 20,
                }}
                className="transition-colors hover:border-purple-500/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</h3>
                  <Badge
                    color={statusColors[p.status].color}
                    bg={statusColors[p.status].bg}
                  >
                    {p.status}
                  </Badge>
                </div>
                <p
                  style={{
                    color: C.textSecondary,
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  {p.description}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 12, color: C.textMuted }}>
                    {p.engine}
                  </span>
                  <span style={{ fontSize: 12, color: C.textMuted }}>
                    {p.tasks.length} tasks · {p.milestones.length} milestones
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: C.bgSurface,
                    borderRadius: 9999,
                    height: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${p.progress}%`,
                      height: "100%",
                      backgroundColor: C.accent,
                      borderRadius: 9999,
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                  {p.progress}% complete
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* New Project Modal */}
      {showNewProject && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 32,
              width: 440,
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
              New Project
            </h3>
            {(["name", "description"] as const).map((f) => (
              <div key={f} style={{ marginBottom: 14 }}>
                <label
                  htmlFor={`proj-${f}`}
                  style={{
                    fontSize: 13,
                    color: C.textSecondary,
                    display: "block",
                    marginBottom: 4,
                    textTransform: "capitalize",
                  }}
                >
                  {f}
                </label>
                <input
                  id={`proj-${f}`}
                  value={newForm[f]}
                  onChange={(e) =>
                    setNewForm((p) => ({ ...p, [f]: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    backgroundColor: C.bgSurface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "9px 12px",
                    color: C.textPrimary,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label
                htmlFor="proj-engine"
                style={{
                  fontSize: 13,
                  color: C.textSecondary,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Engine
              </label>
              <select
                id="proj-engine"
                value={newForm.engine}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, engine: e.target.value }))
                }
                style={{
                  width: "100%",
                  backgroundColor: C.bgSurface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "9px 12px",
                  color: C.textPrimary,
                  fontSize: 14,
                }}
              >
                {ENGINES.map((e) => (
                  <option key={e.id} value={e.name}>
                    {e.emoji} {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={createProject}
                style={{
                  flex: 1,
                  backgroundColor: C.accent,
                  color: "#fff",
                  padding: "10px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                }}
                className="hover:opacity-90"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowNewProject(false)}
                style={{
                  flex: 1,
                  backgroundColor: C.bgSurface,
                  color: C.textSecondary,
                  padding: "10px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  border: `1px solid ${C.border}`,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Task Modal */}
      {showAddTask && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 32,
              width: 400,
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
              Add Task
            </h3>
            {(["title", "description"] as const).map((f) => (
              <div key={f} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: C.textSecondary,
                    display: "block",
                    marginBottom: 4,
                    textTransform: "capitalize",
                  }}
                >
                  {f}
                </div>
                <input
                  value={newTask[f]}
                  onChange={(e) =>
                    setNewTask((p) => ({ ...p, [f]: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    backgroundColor: C.bgSurface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "9px 12px",
                    color: C.textPrimary,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 13,
                  color: C.textSecondary,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Priority
              </div>
              <select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask((p) => ({
                    ...p,
                    priority: e.target.value as Task["priority"],
                  }))
                }
                style={{
                  width: "100%",
                  backgroundColor: C.bgSurface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "9px 12px",
                  color: C.textPrimary,
                  fontSize: 14,
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={addTask}
                style={{
                  flex: 1,
                  backgroundColor: C.accent,
                  color: "#fff",
                  padding: "10px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                }}
                className="hover:opacity-90"
              >
                Add Task
              </button>
              <button
                type="button"
                onClick={() => setShowAddTask(false)}
                style={{
                  flex: 1,
                  backgroundColor: C.bgSurface,
                  color: C.textSecondary,
                  padding: "10px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  border: `1px solid ${C.border}`,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
