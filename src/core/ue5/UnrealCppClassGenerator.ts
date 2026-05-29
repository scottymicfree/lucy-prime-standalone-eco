// =========================================================================
// UnrealCppClassGenerator — CPLUS_FORGE (LL268)
// FILE: src/core/ue5/UnrealCppClassGenerator.ts
// =========================================================================
//
// WHAT THIS DOES:
//   Generates Unreal Engine 5 C++ class boilerplate based on user specifications.
//
// WHY THIS EXISTS:
//   To scaffold generic UE5 logic structures quickly as part of BuilderOS, 
//   saving time when creating new characters, game modes, or custom actors.
//
// HOW THIS WORKS:
//   Provides a static method `generateClassFiles` that accepts class name 
//   and base class string. It returns .h and .cpp file representations.
//
// HOW TO CHANGE IT:
//   You can add or modify UE5 macros (UCLASS, GENERATED_BODY) or default 
//   includes here to keep the boilerplate up to date with Epic's standards.
//
// DEBUG EXAMPLE:
//   If an invalid base class is provided, the generation might lack necessary 
//   includes. Ensure correct mapping in `moduleIncludes`.
//
// =========================================================================

export interface GeneratedClassData {
  headerContent: string;
  sourceContent: string;
  className: string;
}

export class UnrealCppClassGenerator {
  public static generateClassFiles(className: string, baseClass: string, projectName: string = "MyProject"): GeneratedClassData {
    const apiMacro = `${projectName.toUpperCase()}_API`;
    const prefix = this.getPrefixForBaseClass(baseClass);
    const fullClassName = `${prefix}${className}`;

    const headerContent = this.generateHeader(fullClassName, baseClass, apiMacro);
    const sourceContent = this.generateSource(fullClassName, baseClass);

    return {
      headerContent,
      sourceContent,
      className: fullClassName
    };
  }

  private static getPrefixForBaseClass(baseClass: string): string {
    if (baseClass.includes("Actor")) return "A";
    if (baseClass.includes("Character") || baseClass.includes("Pawn")) return "A";
    if (baseClass.includes("Object")) return "U";
    if (baseClass.includes("Component")) return "U";
    return "A"; // default to Actor prefix
  }

  private static generateHeader(className: string, baseClass: string, apiMacro: string): string {
    const includeFile = `${className.replace(/^[AU]/, '')}.h`;
    
    return `#pragma once

#include "CoreMinimal.h"
#include "GameFramework/${baseClass}.h"
#include "${includeFile}.generated.h"

/**
 * 
 */
UCLASS()
class ${apiMacro} ${className} : public ${baseClass}
{
	GENERATED_BODY()

public:
	// Sets default values for this class's properties
	${className}();

protected:
	// Called when the game starts or when spawned
	virtual void BeginPlay() override;

public:	
	// Called every frame
	virtual void Tick(float DeltaTime) override;
};
`;
  }

  private static generateSource(className: string, baseClass: string): string {
    const includeFile = `${className.replace(/^[AU]/, '')}.h`;

    return `#include "${includeFile}"

// Sets default values
${className}::${className}()
{
 	// Set this class to call Tick() every frame.  You can turn this off to improve performance if you don't need it.
	PrimaryActorTick.bCanEverTick = true;
}

// Called when the game starts or when spawned
void ${className}::BeginPlay()
{
	Super::BeginPlay();
	
}

// Called every frame
void ${className}::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

}
`;
  }

  public static generateFromUserPrompt(prompt: string, projectName: string = "MyProject"): GeneratedClassData {
    // Basic heuristic-based generation
    let baseClass = "AActor";
    let className = "MyCustomClass";

    const promptLower = prompt.toLowerCase();
    
    // Determine base class
    if (promptLower.includes("character")) {
      baseClass = "ACharacter";
      className = "MyCharacter";
    } else if (promptLower.includes("pawn")) {
      baseClass = "APawn";
      className = "MyPawn";
    } else if (promptLower.includes("component")) {
      baseClass = "UActorComponent";
      className = "MyComponent";
    } else if (promptLower.includes("gamemode") || promptLower.includes("game mode")) {
      baseClass = "AGameModeBase";
      className = "MyGameMode";
    } else if (promptLower.includes("controller")) {
      if (promptLower.includes("ai")) {
        baseClass = "AAIController";
        className = "MyAIController";
      } else {
        baseClass = "APlayerController";
        className = "MyPlayerController";
      }
    }

    // Attempt to extract requested name from prompt
    // For example: "Create a character named StealthHero"
    const nameMatch = prompt.match(/(?:named|called)\s+([A-Za-z0-9_]+)/i);
    if (nameMatch && nameMatch[1]) {
      className = nameMatch[1];
    }

    // Strip prefix if the user included it
    if ((className.startsWith("A") || className.startsWith("U")) && className.length > 1 && className[1] === className[1].toUpperCase()) {
      className = className.substring(1);
    }

    return this.generateClassFiles(className, baseClass, projectName);
  }
}
