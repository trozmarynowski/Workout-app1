import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTime, formatDate } from '../utils';
import { Workout, WorkoutExercise } from '../types';
import { Calendar, Clock, ChevronRight, Dumbbell, History, Trash2, Search, Trophy, TrendingUp, TrendingDown } from 'lucide-react';

interface HistoryListProps {
  key?: React.Key;
  workouts: Workout[];
  onDeleteWorkout: (id: string) => void;
}

function getExerciseStats(allWorkouts: Workout[], workoutId: string, exerciseId: string) {
  const sorted = [...allWorkouts].sort((a, b) => a.startTime - b.startTime);
  const currentIdx = sorted.findIndex(w => w.id === workoutId);
  const currentWorkout = sorted[currentIdx];
  if (!currentWorkout) return null;

  const currentWe = currentWorkout.exercises.find(we => we.exercise.id === exerciseId);
  if (!currentWe) return null;

  let currentVolume = 0;
  let maxWeight = 0;
  let maxReps = 0;
  let maxVolume = 0;
  let prevMaxWeight = 0;
  let prevMaxReps = 0;
  let prevMaxVolume = 0;
  let previousWe: WorkoutExercise | null = null;
  let prevVolume = 0;

  // Calculate current volume
  currentWe.sets.filter(s => s.completed).forEach(s => {
    currentVolume += (s.weight || 0) * (s.reps || 0);
  });

  // Calculate stats
  for (let i = 0; i <= currentIdx; i++) {
    const w = sorted[i];
    const we = w.exercises.find(e => e.exercise.id === exerciseId);
    if (!we) continue;

    const isCurrent = i === currentIdx;
    
    if (!isCurrent) {
      previousWe = we;
    }

    let vol = 0;
    we.sets.filter(s => s.completed).forEach(s => {
      const weight = s.weight || 0;
      const reps = s.reps || 0;
      
      if (weight > maxWeight) maxWeight = weight;
      if (reps > maxReps) maxReps = reps;
      vol += weight * reps;
      
      if (!isCurrent) {
        if (weight > prevMaxWeight) prevMaxWeight = weight;
        if (reps > prevMaxReps) prevMaxReps = reps;
      }
    });

    if (vol > maxVolume) maxVolume = vol;
    if (!isCurrent && vol > prevMaxVolume) prevMaxVolume = vol;
  }

  if (previousWe) {
    previousWe.sets.filter(s => s.completed).forEach(s => {
      prevVolume += (s.weight || 0) * (s.reps || 0);
    });
  }

  return {
    currentVolume,
    prevVolume,
    volumeDiff: currentVolume - prevVolume,
    hasPrevWorkout: !!previousWe,
    previousWe,
    pr: {
      maxWeight,
      maxReps,
      maxVolume,
      isNewMaxWeight: maxWeight > prevMaxWeight && prevMaxWeight > 0,
      isNewMaxReps: maxReps > prevMaxReps && prevMaxReps > 0,
      isNewMaxVolume: maxVolume > prevMaxVolume && prevMaxVolume > 0,
    }
  };
}

export function HistoryList({ workouts, onDeleteWorkout }: HistoryListProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const sortedWorkouts = [...workouts].sort((a, b) => b.startTime - a.startTime);
  
  const filteredWorkouts = sortedWorkouts.filter(workout => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const hasExercise = workout.exercises.some(we => 
        we.exercise.name.toLowerCase().includes(query)
      );
      if (!hasExercise) return false;
    }

    if (filterStartDate) {
      const startObj = new Date(filterStartDate);
      startObj.setHours(0, 0, 0, 0);
      if (workout.startTime < startObj.getTime()) return false;
    }

    if (filterEndDate) {
      const endObj = new Date(filterEndDate);
      endObj.setHours(23, 59, 59, 999);
      if (workout.startTime > endObj.getTime()) return false;
    }

    return true;
  });

  if (selectedWorkout) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="pb-24 pt-6 px-4 relative"
      >
        {showConfirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Usuń trening</h3>
              <p className="text-neutral-400 text-sm mb-6">Czy na pewno chcesz trwale usunąć ten trening z historii? Tej operacji nie można cofnąć.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmDelete(null)}
                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  onClick={() => {
                    if (showConfirmDelete) {
                      onDeleteWorkout(showConfirmDelete);
                    }
                    setShowConfirmDelete(null);
                    setSelectedWorkout(null);
                  }}
                  className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-colors border border-red-500/20"
                >
                  Usuń
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setSelectedWorkout(null)}
            className="text-neutral-400 font-medium text-sm flex items-center uppercase tracking-wider"
          >
            <ChevronRight className="rotate-180 mr-1" size={16} /> Wróć do listy
          </button>
          
          <button
            onClick={() => setShowConfirmDelete(selectedWorkout.id)}
            className="text-red-500 hover:text-red-400 p-2 rounded-full bg-neutral-900 border border-neutral-800"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-2 text-white">Podsumowanie</h2>
        <div className="flex items-center gap-4 text-neutral-400 text-sm mb-8 font-mono">
          <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(selectedWorkout.startTime)}</span>
          {selectedWorkout.duration && (
            <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(selectedWorkout.duration)}</span>
          )}
        </div>

        <div className="space-y-6">
          {selectedWorkout.exercises.map((we) => {
            const completedSets = we.sets.filter(s => s.completed);
            if (completedSets.length === 0) return null;

            const stats = getExerciseStats(workouts, selectedWorkout.id, we.exercise.id);

            return (
              <div key={we.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neon shrink-0">
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{we.exercise.name}</h3>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">{we.exercise.muscleGroup}</p>
                  </div>
                </div>

                {stats && (
                  <div className="mb-4 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 flex flex-col items-center justify-center text-center">
                      <span className="text-neutral-500 mb-1 uppercase tracking-wider">Objętość</span>
                      <span className="text-white font-bold text-lg">{stats.currentVolume} <span className="text-sm font-normal text-neutral-500">kg</span></span>
                      {stats.hasPrevWorkout && stats.volumeDiff !== 0 && (
                        <span className={`text-[10px] mt-1 flex items-center gap-1 ${stats.volumeDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stats.volumeDiff > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {stats.volumeDiff > 0 ? '+' : ''}{stats.volumeDiff} kg
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 flex flex-col items-center justify-center text-center">
                      <span className="text-neutral-500 mb-1 uppercase tracking-wider flex items-center gap-1"><Trophy size={10} className="text-yellow-500" /> Rekordy</span>
                      <div className="text-neutral-400 leading-tight space-y-0.5">
                        {stats.pr.maxWeight > 0 && <div>Maks: <span className="text-white font-bold">{stats.pr.maxWeight}</span> kg {stats.pr.isNewMaxWeight && <span className="text-yellow-500">🔥</span>}</div>}
                        {stats.pr.maxReps > 0 && <div>Powt: <span className="text-white font-bold">{stats.pr.maxReps}</span> {stats.pr.isNewMaxReps && <span className="text-yellow-500">🔥</span>}</div>}
                        {stats.pr.maxVolume > 0 && <div>Objętość: <span className="text-white font-bold">{stats.pr.maxVolume}</span> kg {stats.pr.isNewMaxVolume && <span className="text-yellow-500">🔥</span>}</div>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-2">
                  <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-neutral-500 tracking-wider px-2">
                    <div className="col-span-2 text-center">Seria</div>
                    <div className="col-span-3 text-center">kg</div>
                    <div className="col-span-3 text-center">Powt.</div>
                    <div className="col-span-4 text-right">Progres</div>
                  </div>
                  {completedSets.map((set, idx) => {
                    let diffElement = null;
                    if (stats?.previousWe) {
                      const prevSets = stats.previousWe.sets.filter(s => s.completed);
                      const prevSet = prevSets[idx];
                      if (prevSet) {
                        const weightDiff = (set.weight || 0) - (prevSet.weight || 0);
                        const repsDiff = (set.reps || 0) - (prevSet.reps || 0);

                        if (weightDiff !== 0) {
                          const isPos = weightDiff > 0;
                          diffElement = <span className={`text-[10px] ${isPos ? 'text-green-500' : 'text-red-500'} flex items-center justify-end gap-1 font-bold`}>{isPos ? '+' : ''}{weightDiff} kg {isPos && '🔥'}</span>;
                        } else if (repsDiff !== 0) {
                          const isPos = repsDiff > 0;
                          diffElement = <span className={`text-[10px] ${isPos ? 'text-green-500' : 'text-red-500'} flex items-center justify-end gap-1 font-bold`}>{isPos ? '+' : ''}{repsDiff} powt {isPos && '💪'}</span>;
                        } else {
                          diffElement = <span className="text-[10px] text-neutral-600 font-bold">-</span>;
                        }
                      }
                    }

                    return (
                      <div key={set.id} className="grid grid-cols-12 gap-2 items-center text-sm font-mono bg-neutral-950/50 rounded-lg p-2 border border-neutral-800">
                        <div className="col-span-2 text-center text-neutral-400">{idx + 1}</div>
                        <div className="col-span-3 text-center text-white">{set.weight || '-'}</div>
                        <div className="col-span-3 text-center text-white">{set.reps || '-'}</div>
                        <div className="col-span-4 text-right pr-2 flex items-center justify-end h-full">
                          {diffElement}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pb-24 pt-8 px-4"
    >
      <h1 className="text-3xl font-bold mb-6 text-white px-2 tracking-tight">Historia</h1>

      <div className="px-2 mb-8 space-y-3">
        <label className="relative block">
          <span className="absolute inset-y-0 left-4 flex items-center text-neutral-500">
            <Search size={18} />
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj po nazwie ćwiczenia..."
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors placeholder:text-neutral-500 font-mono text-sm shadow-sm"
          />
        </label>
        
        <div className="flex gap-3">
          <label className="flex-1 relative block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-500">
              <Calendar size={14} />
            </div>
            <input 
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-3 pl-9 pr-3 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors text-xs font-mono shadow-sm [color-scheme:dark]"
            />
          </label>
          <label className="flex-1 relative block">
             <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-500">
              <Calendar size={14} />
            </div>
            <input 
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-3 pl-9 pr-3 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors text-xs font-mono shadow-sm [color-scheme:dark]"
            />
          </label>
        </div>
      </div>

      {filteredWorkouts.length === 0 ? (
        <div className="text-center text-neutral-500 mt-20 px-6">
          <History size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">Brak zapisanych treningów.</p>
          {(searchQuery || filterStartDate || filterEndDate) ? (
            <p className="text-sm mt-2">Nie znaleziono treningów spełniających kryteria.</p>
          ) : (
            <p className="text-sm mt-2">Zacznij ćwiczyć, aby zobaczyć tutaj swój progres.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkouts.map(workout => {
            const completedExercisesCount = workout.exercises.filter(we => we.sets.some(s => s.completed)).length;
            
            return (
              <button 
                key={workout.id}
                onClick={() => setSelectedWorkout(workout)}
                className="w-full text-left bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-5 rounded-2xl flex items-center justify-between group transition-colors shadow-sm"
              >
                <div>
                  <div className="font-bold text-white text-lg mb-1">{formatDate(workout.startTime)}</div>
                  <div className="flex items-center gap-4 text-xs text-neutral-400 font-mono">
                    {workout.duration && (
                      <span className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-800">
                        <Clock size={12} className="text-neon" /> {formatTime(workout.duration)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-800">
                      <Dumbbell size={12} className="text-neon" /> {completedExercisesCount} ćw.
                    </span>
                  </div>
                </div>
                <ChevronRight className="text-neutral-600 group-hover:text-neon transition-colors" />
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
