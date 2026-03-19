import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Array "mo:core/Array";
import List "mo:core/List";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type Engine = {
    id : Nat;
    name : Text;
    description : Text;
    features : [Text];
    platforms : [Text];
    license : Text;
    website : Text;
    logoUrl : Text;
    stars : Nat;
    category : Text;
  };

  type Tutorial = {
    id : Nat;
    title : Text;
    description : Text;
    content : Text;
    engineId : ?Nat;
    skillLevel : SkillLevel;
    tags : [Text];
    author : Text;
    duration : Text;
    views : Nat;
  };

  type Channel = {
    id : Nat;
    name : Text;
    description : Text;
    engineId : ?Nat;
    postCount : Nat;
  };

  type Post = {
    id : Nat;
    channelId : Nat;
    title : Text;
    content : Text;
    authorName : Text;
    replyCount : Nat;
    views : Nat;
    tags : [Text];
  };

  type Reply = {
    id : Nat;
    postId : Nat;
    content : Text;
    authorName : Text;
  };

  public type Project = {
    id : Nat;
    name : Text;
    description : Text;
    owner : Principal;
    status : ProjectStatus;
    engineId : ?Nat;
    progress : Nat;
  };

  public type Task = {
    id : Nat;
    projectId : Nat;
    title : Text;
    description : Text;
    status : TaskStatus;
    priority : TaskPriority;
  };

  public type Milestone = {
    id : Nat;
    projectId : Nat;
    title : Text;
    dueDate : Time.Time;
    completed : Bool;
  };

  public type SkillLevel = {
    #beginner;
    #intermediate;
    #advanced;
  };

  public type ProjectStatus = {
    #active;
    #completed;
    #archived;
  };

  public type TaskStatus = {
    #todo;
    #inProgress;
    #done;
  };

  public type TaskPriority = {
    #low;
    #medium;
    #high;
  };

  public type UserProfile = {
    name : Text;
  };

  module Project {
    public func compare(project1 : Project, project2 : Project) : Order.Order {
      Nat.compare(project1.id, project2.id);
    };
  };

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Nat.compare(task1.id, task2.id);
    };
  };

  module Milestone {
    public func compare(m1 : Milestone, m2 : Milestone) : Order.Order {
      Nat.compare(m1.id, m2.id);
    };
  };

  // Asset types and storage
  type Asset = {
    id : Nat;
    name : Text;
    description : Text;
    category : AssetCategory;
    engineTags : [Text];
    uploaderName : Text;
    fileSize : Text;
    downloadCount : Nat;
    previewUrl : Text;
    blobId : ?Text;
  };

  public type AssetCategory = {
    #sprites;
    #audio;
    #models;
    #shaders;
    #tilemaps;
    #fonts;
  };

  var assetCounter = 1;
  let assets = Map.empty<Nat, Asset>();

  var engineCounter = 1;
  var tutorialCounter = 1;
  var channelCounter = 1;
  var postCounter = 1;
  var replyCounter = 1;
  var projectCounter = 1;
  var taskCounter = 1;
  var milestoneCounter = 1;

  let engines = Map.empty<Nat, Engine>();
  let tutorials = Map.empty<Nat, Tutorial>();
  let channels = Map.empty<Nat, Channel>();
  let posts = Map.empty<Nat, Post>();
  let replies = Map.empty<Nat, Reply>();
  let projects = Map.empty<Nat, Project>();
  let tasks = Map.empty<Nat, Task>();
  let milestones = Map.empty<Nat, Milestone>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  ////////////////////////////////////////
  // Persistent Data Structures
  ////////////////////////////////////////

  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Your backend implementation goes here...

  ////////////////////////////////////////
  // Asset Management API
  ////////////////////////////////////////

  public query func getAllAssets() : async [Asset] {
    assets.values().toArray();
  };

  public query func getAssetById(id : Nat) : async ?Asset {
    assets.get(id);
  };

  public query func getAssetsByCategory(category : AssetCategory) : async [Asset] {
    let filtered = List.empty<Asset>();
    assets.values().forEach(
      func(asset) {
        if (asset.category == category) {
          filtered.add(asset);
        };
      }
    );
    filtered.toArray();
  };

  public shared ({ caller }) func createAsset(
    name : Text,
    description : Text,
    category : AssetCategory,
    engineTags : [Text],
    uploaderName : Text,
    fileSize : Text,
    previewUrl : Text,
    blobId : ?Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can upload assets");
    };

    let asset : Asset = {
      id = assetCounter;
      name;
      description;
      category;
      engineTags;
      uploaderName;
      fileSize;
      downloadCount = 0;
      previewUrl;
      blobId;
    };
    assets.add(assetCounter, asset);
    assetCounter += 1;
    asset.id;
  };

  public shared ({ caller }) func incrementAssetDownloadCount(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can download assets");
    };

    switch (assets.get(id)) {
      case (?asset) {
        let updated : Asset = {
          id = asset.id;
          name = asset.name;
          description = asset.description;
          category = asset.category;
          engineTags = asset.engineTags;
          uploaderName = asset.uploaderName;
          fileSize = asset.fileSize;
          downloadCount = asset.downloadCount + 1;
          previewUrl = asset.previewUrl;
          blobId = asset.blobId;
        };
        assets.add(id, updated);
      };
      case (null) {
        Runtime.trap("Asset does not exist");
      };
    };
  };
};
