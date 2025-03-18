import React from 'react';
import { CpuIcon, ZapIcon, ServerIcon, CircuitBoardIcon, BrainIcon, TimerIcon, LockIcon, PlayCircleIcon, CheckCircleIcon, AlertTriangleIcon, AlertCircleIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ResourceTooltip } from '@/components/ui/educational-tooltip';
import { formatCurrency } from '@/lib/utils';
import { GameStateType, Era, TrainingStatus } from '@/lib/gameState';

interface ComputePanelProps {
  gameState: GameStateType;
  trainModel: () => void;
}

export default function ComputePanel({ gameState, trainModel }: ComputePanelProps) {
  const { computeCapacity, money } = gameState;
  
  // Calculate percentage of compute capacity being used
  const computeUsagePercent = Math.min(100, Math.round((computeCapacity.used / computeCapacity.maxCapacity) * 100));
  const computeAvailablePercent = Math.min(100, Math.round((computeCapacity.available / computeCapacity.maxCapacity) * 100));
  
  // Check for capacity pressure and potential outages
  const isNearCapacity = computeUsagePercent >= 90;
  const isCritical = computeUsagePercent >= 95;
  
  // Helper function to get next era
  const getNextEra = (currentEra: Era): Era => {
    switch (currentEra) {
      case Era.GNT2: return Era.GNT3;
      case Era.GNT3: return Era.GNT4;
      case Era.GNT4: return Era.GNT5;
      case Era.GNT5: return Era.GNT6;
      case Era.GNT6: return Era.GNT7;
      case Era.GNT7: return Era.GNT7; // Already at max
    }
  };
  
  // Determine the next era that we're working towards
  const nextEra = getNextEra(gameState.currentEra);
  
  // Get the training run data for the next era if it exists
  // Note: For GNT-2 era, there won't be a run in the runs object since we start at GNT-2 and train toward GNT-3
  const targetTrainingRun = Object.prototype.hasOwnProperty.call(gameState.training.runs, nextEra) ? 
    gameState.training.runs[nextEra as keyof typeof gameState.training.runs] : null;
  
  // Get active training run status if any
  const isTrainingActive = gameState.training.active;
  const trainingStatus = targetTrainingRun?.status || TrainingStatus.LOCKED;
  const trainingProgress = isTrainingActive && targetTrainingRun ? 
    Math.round(((targetTrainingRun.daysRequired - gameState.training.daysRemaining) / targetTrainingRun.daysRequired) * 100) : 
    0;
  
  // Calculate algorithm research progress
  const algorithmResearchProgress = Math.round(gameState.training.algorithmResearchProgress);
  
  // Function to get status badge styling
  const getStatusBadge = (status: TrainingStatus) => {
    switch (status) {
      case TrainingStatus.LOCKED:
        return { 
          bg: "bg-gray-700", 
          text: "text-gray-400", 
          icon: <LockIcon className="h-3 w-3 mr-1" />,
          label: "Locked"
        };
      case TrainingStatus.AVAILABLE:
        return { 
          bg: "bg-green-700", 
          text: "text-green-300", 
          icon: <PlayCircleIcon className="h-3 w-3 mr-1" />,
          label: "Ready"
        };
      case TrainingStatus.IN_PROGRESS:
        return { 
          bg: "bg-blue-700", 
          text: "text-blue-300", 
          icon: <TimerIcon className="h-3 w-3 mr-1" />,
          label: "Training"
        };
      case TrainingStatus.COMPLETE:
        return { 
          bg: "bg-purple-700", 
          text: "text-purple-300", 
          icon: <CheckCircleIcon className="h-3 w-3 mr-1" />,
          label: "Complete"
        };
    }
  };
  
  // Get badge for current training run
  const statusBadge = getStatusBadge(trainingStatus);
  
  // Function to get prerequisites for the training run
  const getMissingPrerequisites = () => {
    if (!targetTrainingRun || trainingStatus !== TrainingStatus.LOCKED) return [];
    
    const prereqs = targetTrainingRun.prerequisites;
    const missing: string[] = [];
    
    // Check compute level
    if (gameState.levels.compute < prereqs.compute) {
      missing.push(`Compute Level: ${gameState.levels.compute}/${prereqs.compute}`);
    }
    
    // Check data prerequisites
    if (gameState.dataInputs.quality < prereqs.data.quality) {
      missing.push(`Data Quality: ${gameState.dataInputs.quality}/${prereqs.data.quality}`);
    }
    if (gameState.dataInputs.quantity < prereqs.data.quantity) {
      missing.push(`Data Quantity: ${gameState.dataInputs.quantity}/${prereqs.data.quantity}`);
    }
    if (gameState.dataInputs.formats < prereqs.data.formats) {
      missing.push(`Data Formats: ${gameState.dataInputs.formats}/${prereqs.data.formats}`);
    }
    
    // Check algorithm prerequisites
    if (gameState.algorithmInputs.architectures < prereqs.algorithm.architectures) {
      missing.push(`Algorithm Architectures: ${gameState.algorithmInputs.architectures}/${prereqs.algorithm.architectures}`);
    }
    if (gameState.training.algorithmResearchProgress < prereqs.algorithm.researchProgress) {
      missing.push(`Algorithm Research: ${Math.floor(gameState.training.algorithmResearchProgress)}/${prereqs.algorithm.researchProgress}%`);
    }
    
    // Check compute inputs
    if (gameState.computeInputs.electricity < prereqs.computeInputs.electricity) {
      missing.push(`Electricity: ${gameState.computeInputs.electricity}/${prereqs.computeInputs.electricity}`);
    }
    if (gameState.computeInputs.hardware < prereqs.computeInputs.hardware) {
      missing.push(`Hardware: ${gameState.computeInputs.hardware}/${prereqs.computeInputs.hardware}`);
    }
    if (gameState.computeInputs.regulation < prereqs.computeInputs.regulation) {
      missing.push(`Regulatory Compliance: ${gameState.computeInputs.regulation}/${prereqs.computeInputs.regulation}`);
    }
    
    return missing;
  };
  
  // Get the missing prerequisites
  const missingPrerequisites = getMissingPrerequisites();
  
  // Check if there's enough compute for the training run
  const hasEnoughCompute = computeCapacity.available >= (targetTrainingRun?.computeRequired || 0);
  
  // Determine if the button should be enabled
  const canStartTraining = trainingStatus === TrainingStatus.AVAILABLE && 
                           !isTrainingActive && 
                           hasEnoughCompute;
  
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CpuIcon className="h-5 w-5 text-blue-400" />
            <span className="text-white">AI Training System</span>
          </div>
          <ResourceTooltip 
            content={
              <div className="space-y-2 max-w-xs">
                <p>The Training System is the core mechanic for advancing your AI to new eras.</p>
                <p>Each era requires more sophisticated training runs with higher resource requirements.</p>
                <p>Training runs require dedicated compute capacity and advance your AI's intelligence significantly.</p>
              </div>
            }
            resourceType="compute"
          >
            <span className="sr-only">Learn about the training system</span>
          </ResourceTooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compute Capacity Metrics */}
        <div className="grid grid-cols-1 gap-2 text-center">
          <div className="bg-gray-800 p-2 rounded border border-gray-700">
            <h4 className="text-xs font-medium text-blue-400 mb-2">Compute Distribution</h4>
            <div className="grid grid-cols-3 gap-1">
              <div className="bg-gray-700 rounded p-2">
                <div className="text-xs text-green-400 mb-1">Research</div>
                <div className="font-semibold text-green-400 flex justify-center items-center gap-1">
                  <ZapIcon className="h-3 w-3" />
                  {(computeCapacity.freeCompute || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">{computeCapacity.freeCompute ? Math.round((computeCapacity.freeCompute / computeCapacity.maxCapacity) * 100) : 0}% of max</div>
              </div>
              <div className="bg-gray-700 rounded p-2">
                <div className="text-xs text-purple-400 mb-1">Customer</div>
                <div className="font-semibold text-purple-400 flex justify-center items-center gap-1">
                  <ServerIcon className="h-3 w-3" />
                  {(computeCapacity.customerUsage || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">{computeCapacity.customerUsage ? Math.round((computeCapacity.customerUsage / computeCapacity.maxCapacity) * 100) : 0}% of max</div>
              </div>
              <div className="bg-gray-700 rounded p-2">
                <div className="text-xs text-amber-400 mb-1">Training</div>
                <div className="font-semibold text-amber-400 flex justify-center items-center gap-1">
                  <BrainIcon className="h-3 w-3" />
                  {(gameState.training.computeReserved || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">{gameState.training.computeReserved ? Math.round((gameState.training.computeReserved / computeCapacity.maxCapacity) * 100) : 0}% of max</div>
              </div>
            </div>
            <div className="mt-2 p-1.5 bg-gray-900 rounded-sm">
              <div className="text-xs text-gray-400 flex items-center">
                <CircuitBoardIcon className="h-3 w-3 mr-1 text-blue-400" />
                <span>Maximum Capacity: {computeCapacity.maxCapacity.toLocaleString()} units</span>
                <span className="mx-1 text-gray-500">•</span>
                <span className="text-gray-400">Used: {Math.round((computeCapacity.used / computeCapacity.maxCapacity) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Training Run Status Section */}
        <div className="mt-4 bg-gray-900 rounded-lg border border-gray-700 p-3 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-white font-medium">{targetTrainingRun?.name || `${nextEra} Training`}</h3>
              <p className="text-xs text-gray-400 mt-1">{targetTrainingRun?.description || "Advance to the next AI capability level"}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs flex items-center ${statusBadge.bg} ${statusBadge.text}`}>
              {statusBadge.icon}
              {statusBadge.label}
            </span>
          </div>
          
          {/* For in-progress training, show progress bar */}
          {trainingStatus === TrainingStatus.IN_PROGRESS && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400">Training Progress</span>
                <span>{trainingProgress}%</span>
              </div>
              <Progress 
                value={trainingProgress} 
                className="h-2 bg-gray-700 [&>div]:bg-blue-500" 
              />
              <p className="text-xs text-gray-400 mt-2 flex items-center">
                <TimerIcon className="h-3 w-3 mr-1 text-blue-400" />
                {gameState.training.daysRemaining} days remaining
              </p>
            </div>
          )}
          
          {/* For not-yet-started training, show algorithm research progress */}
          {(trainingStatus === TrainingStatus.LOCKED || trainingStatus === TrainingStatus.AVAILABLE) && !isTrainingActive && (
            <div>
              <div className="bg-gray-800 rounded-md p-2 mb-2 border border-purple-900/40">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    <BrainIcon className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Algorithm Research Progress</span>
                  </div>
                  <div className="px-2 py-0.5 bg-purple-900/30 rounded-full text-xs text-purple-300 font-medium">
                    {algorithmResearchProgress}%
                  </div>
                </div>
                
                <Progress 
                  value={algorithmResearchProgress} 
                  className="h-2.5 bg-gray-700 [&>div]:bg-purple-500" 
                />
                
                <div className="mt-2 text-xs flex items-center">
                  <div className="flex-1 flex items-center text-gray-400">
                    <ZapIcon className="h-3 w-3 mr-1 text-green-400" />
                    <span>Free Compute: {computeCapacity.freeCompute || 0} units</span>
                  </div>
                  <div className="flex-1 text-right text-gray-400">
                    Rate: +{gameState.training.algorithmResearchRate.toFixed(2)}/day
                  </div>
                </div>
                
                {/* Resource allocation breakdown */}
                <div className="mt-2 grid grid-cols-3 gap-1 bg-gray-700/40 rounded p-1">
                  <div className="text-xs text-purple-400 flex items-center justify-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-purple-400 mr-1"></span>
                    Customer: {computeCapacity.customerUsage || 0}
                  </div>
                  <div className="text-xs text-amber-400 flex items-center justify-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-400 mr-1"></span>
                    Training: {gameState.training.computeReserved || 0}
                  </div>
                  <div className="text-xs text-green-400 flex items-center justify-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-1"></span>
                    Research: {computeCapacity.freeCompute || 0}
                  </div>
                </div>
                
                {/* Research Engineers Section */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-purple-400">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span className="text-sm font-medium text-white">Research Engineers</span>
                    </div>
                    <div className="px-2 py-0.5 bg-blue-900/30 rounded-full text-xs text-blue-300 font-medium">
                      {gameState.algorithmInputs.researchEngineers || 0} Hired
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-gray-700/50 p-2 rounded">
                      <div className="text-xs text-gray-400">Research Rate</div>
                      <div className="text-sm font-medium text-blue-400">+{(gameState.algorithmInputs.researchEngineers || 0) * 0.5}/day</div>
                    </div>
                    <div className="bg-gray-700/50 p-2 rounded">
                      <div className="text-xs text-gray-400">Cost Per Engineer</div>
                      <div className="text-sm font-medium text-green-400">${formatCurrency(250)}</div>
                    </div>
                  </div>
                  
                  <button 
                    className={`w-full py-1.5 px-3 rounded text-xs flex justify-between items-center ${
                      money >= 250
                        ? "bg-purple-700 hover:bg-purple-600 text-white"
                        : "bg-gray-700 opacity-70 cursor-not-allowed text-gray-300"
                    }`}
                    onClick={() => {}} // TODO: Connect to hireResearchEngineer function
                    disabled={money < 250}
                  >
                    <span>Hire Research Engineer</span>
                    <span className="bg-purple-900 px-2 py-0.5 rounded text-purple-300">$250</span>
                  </button>
                  
                  <p className="text-xs text-gray-400 mt-2 italic">
                    Research engineers work with free compute resources to improve algorithms. Each engineer increases research rate.
                  </p>
                </div>
                
                <p className="text-xs text-gray-400 mt-2 italic">
                  {algorithmResearchProgress < 100 ? 
                    "Research advances faster with more engineers and free compute resources" : 
                    "Research complete! Check other prerequisites to unlock training."}
                </p>
              </div>
            </div>
          )}
          
          {/* If training is locked, show prerequisites */}
          {trainingStatus === TrainingStatus.LOCKED && missingPrerequisites.length > 0 && (
            <div className="mt-2">
              <h4 className="text-xs font-medium text-amber-400 mb-1">Missing Prerequisites:</h4>
              <ul className="space-y-1">
                {missingPrerequisites.map((prereq, index) => (
                  <li key={index} className="text-xs text-gray-300 flex items-center">
                    <LockIcon className="h-3 w-3 mr-1 text-amber-400" />
                    {prereq}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Training Resources Required */}
          {trainingStatus === TrainingStatus.AVAILABLE && !isTrainingActive && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-800 p-2 rounded">
                <span className="text-xs text-gray-400">Compute Required</span>
                <div className={`text-sm font-medium ${hasEnoughCompute ? 'text-green-400' : 'text-red-400'} flex items-center mt-1`}>
                  <CpuIcon className="h-3 w-3 mr-1" />
                  {targetTrainingRun?.computeRequired.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <span className="text-xs text-gray-400">Intelligence Gain</span>
                <div className="text-sm font-medium text-purple-400 flex items-center mt-1">
                  <BrainIcon className="h-3 w-3 mr-1" />
                  +{targetTrainingRun?.intelligenceGain.toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          {/* Start Training Button */}
          {(trainingStatus === TrainingStatus.AVAILABLE || trainingStatus === TrainingStatus.LOCKED) && !isTrainingActive && (
            <button 
              className={`w-full py-2 px-4 rounded-md flex justify-center items-center gap-2 ${
                canStartTraining
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-700 opacity-70 cursor-not-allowed text-gray-300"
              }`}
              onClick={trainModel}
              disabled={!canStartTraining}
            >
              <PlayCircleIcon className="h-4 w-4" />
              {trainingStatus === TrainingStatus.AVAILABLE ? "Start Training Run" : "Unlock Training"}
            </button>
          )}
          
          {/* If training is complete, show completion status */}
          {trainingStatus === TrainingStatus.COMPLETE && (
            <div className="bg-purple-900/30 border border-purple-700 rounded p-2 mt-2 text-center">
              <span className="text-xs text-purple-300 flex items-center justify-center">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Training complete! Your AI has advanced to {nextEra}.
              </span>
            </div>
          )}
        </div>
        
        {/* Usage Progress Bars */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-400">Available Capacity</span>
              <span>{computeAvailablePercent}%</span>
            </div>
            <Progress 
              value={computeAvailablePercent} 
              className="h-2 bg-gray-700 [&>div]:bg-blue-500" 
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={`${isCritical ? 'text-red-400' : isNearCapacity ? 'text-amber-400' : 'text-orange-400'} flex items-center`}>
                {isCritical ? (
                  <>
                    <AlertCircleIcon className="h-3 w-3 mr-1" />
                    Critical Usage
                  </>
                ) : isNearCapacity ? (
                  <>
                    <AlertTriangleIcon className="h-3 w-3 mr-1" />
                    High Usage
                  </>
                ) : (
                  'Used Capacity'
                )}
              </span>
              <span className={isCritical ? 'text-red-400 font-bold' : isNearCapacity ? 'text-amber-400' : ''}>{computeUsagePercent}%</span>
            </div>
            <Progress 
              value={computeUsagePercent} 
              className={`h-2 bg-gray-700 ${
                isCritical ? '[&>div]:bg-red-500 animate-pulse' : 
                isNearCapacity ? '[&>div]:bg-amber-500' : 
                '[&>div]:bg-orange-500'
              }`} 
            />
          </div>
        </div>
        
        {/* Usage Warning */}
        {isCritical && (
          <div className="mt-2 bg-red-900/30 border border-red-800 rounded-md p-2 text-xs text-red-300 flex items-start">
            <AlertCircleIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
            <p>Critical compute saturation detected! Your service quality is severely degraded and customers are leaving. Upgrade compute capacity or reduce service load immediately.</p>
          </div>
        )}
        {isNearCapacity && !isCritical && (
          <div className="mt-2 bg-amber-900/30 border border-amber-800 rounded-md p-2 text-xs text-amber-300 flex items-start">
            <AlertTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
            <p>High compute usage detected. Your services are experiencing intermittent outages. Customer growth and revenue are affected. Consider upgrading compute capacity.</p>
          </div>
        )}
        
        {/* Training Benefits Information */}
        <div className="text-xs text-gray-400 mt-1 bg-gray-900 p-2 rounded border border-gray-800">
          <p className="mb-2">Training runs are critical for advancing your AI to new eras, unlocking new capabilities and stronger revenue streams.</p>
          
          <div className="bg-gray-800 rounded p-2 mt-2 text-center">
            <div className="font-semibold text-blue-400 mb-1">Training Run Requirements</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700 p-1.5 rounded flex flex-col">
                <span className="text-gray-300">Reserved Compute</span>
                <span className="text-amber-400">For 30 days</span>
              </div>
              <div className="bg-gray-700 p-1.5 rounded flex flex-col">
                <span className="text-gray-300">Scale Requirement</span>
                <span className="text-amber-400">10× per era</span>
              </div>
            </div>
          </div>
          
          <p className="mt-2">Each era's training requires 10× more compute than the previous era, along with advanced levels of all infrastructure components.</p>
        </div>
      </CardContent>
    </Card>
  );
}