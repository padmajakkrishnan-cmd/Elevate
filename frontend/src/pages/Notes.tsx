import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PracticeNoteDialog } from '@/components/PracticeNoteDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, BookOpen, Dumbbell, Apple } from 'lucide-react';
import { practiceNotesStorage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import type { PracticeNote } from '@/types';
import { showSuccess } from '@/utils/toast';

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<PracticeNote[]>([]);
  const [editingNote, setEditingNote] = useState<PracticeNote | undefined>();
  const [deleteNote, setDeleteNote] = useState<PracticeNote | null>(null);

  const loadNotes = () => {
    const allNotes = practiceNotesStorage.getAll();
    const userNotes = allNotes.filter(n => n.userId === user?.id);
    setNotes(userNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

  const handleDelete = () => {
    if (deleteNote) {
      practiceNotesStorage.delete(deleteNote.id);
      showSuccess('Note deleted');
      loadNotes();
      setDeleteNote(null);
    }
  };

  const handleEdit = (note: PracticeNote) => {
    setEditingNote(note);
  };

  const handleCloseDialog = () => {
    setEditingNote(undefined);
    loadNotes();
  };

  const getIcon = (type: PracticeNote['type']) => {
    switch (type) {
      case 'practice': return <BookOpen className="w-5 h-5" />;
      case 'workout': return <Dumbbell className="w-5 h-5" />;
      case 'nutrition': return <Apple className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: PracticeNote['type']) => {
    switch (type) {
      case 'practice': return 'Practice';
      case 'workout': return 'Workout';
      case 'nutrition': return 'Nutrition';
    }
  };

  const practiceNotes = notes.filter(n => n.type === 'practice');
  const workoutNotes = notes.filter(n => n.type === 'workout');
  const nutritionNotes = notes.filter(n => n.type === 'nutrition');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Practice Notes</h1>
          <p className="text-gray-400">
            Track practice observations, workouts, and nutrition
          </p>
        </div>
        <PracticeNoteDialog onClose={loadNotes} />
      </div>

      {notes.length === 0 ? (
        <Card className="gradient-card-blue border-blue-500/20">
          <CardContent className="p-8 text-center">
            <div className="gradient-icon-blue p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Notes Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Start documenting your practice sessions, workouts, and nutrition. These notes help you reflect on your progress and identify patterns.
            </p>
            <PracticeNoteDialog onClose={loadNotes} />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-card border border-white/10">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              All Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="practice" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              Practice ({practiceNotes.length})
            </TabsTrigger>
            <TabsTrigger value="workout" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              Workouts ({workoutNotes.length})
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300">
              Nutrition ({nutritionNotes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={setDeleteNote} getIcon={getIcon} getTypeLabel={getTypeLabel} />
            ))}
          </TabsContent>

          <TabsContent value="practice" className="space-y-3 mt-4">
            {practiceNotes.length > 0 ? (
              practiceNotes.map((note) => (
                <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={setDeleteNote} getIcon={getIcon} getTypeLabel={getTypeLabel} />
              ))
            ) : (
              <Card className="gradient-card-blue border-blue-500/20">
                <CardContent className="py-8 text-center text-gray-400">
                  No practice notes yet. Add one to get started!
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="workout" className="space-y-3 mt-4">
            {workoutNotes.length > 0 ? (
              workoutNotes.map((note) => (
                <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={setDeleteNote} getIcon={getIcon} getTypeLabel={getTypeLabel} />
              ))
            ) : (
              <Card className="gradient-card-purple border-purple-500/20">
                <CardContent className="py-8 text-center text-gray-400">
                  No workout notes yet. Add one to get started!
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-3 mt-4">
            {nutritionNotes.length > 0 ? (
              nutritionNotes.map((note) => (
                <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={setDeleteNote} getIcon={getIcon} getTypeLabel={getTypeLabel} />
              ))
            ) : (
              <Card className="gradient-card-green border-green-500/20">
                <CardContent className="py-8 text-center text-gray-400">
                  No nutrition notes yet. Add one to get started!
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {editingNote && (
        <PracticeNoteDialog editNote={editingNote} onClose={handleCloseDialog} />
      )}

      <AlertDialog open={!!deleteNote} onOpenChange={() => setDeleteNote(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Note?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{deleteNote?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-white border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const NoteCard = ({ 
  note, 
  onEdit, 
  onDelete, 
  getIcon, 
  getTypeLabel 
}: { 
  note: PracticeNote; 
  onEdit: (note: PracticeNote) => void; 
  onDelete: (note: PracticeNote) => void;
  getIcon: (type: PracticeNote['type']) => JSX.Element;
  getTypeLabel: (type: PracticeNote['type']) => string;
}) => {
  const getGradientClass = (type: PracticeNote['type']) => {
    switch (type) {
      case 'practice': return 'gradient-icon-blue';
      case 'workout': return 'gradient-icon-purple';
      case 'nutrition': return 'gradient-icon-green';
    }
  };

  const getBadgeClass = (type: PracticeNote['type']) => {
    switch (type) {
      case 'practice': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'workout': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'nutrition': return 'bg-green-500/20 text-green-300 border-green-500/30';
    }
  };

  return (
    <Card className="gradient-card-blue border-blue-500/20">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`${getGradientClass(note.type)} p-2 rounded-lg`}>
                {getIcon(note.type)}
              </div>
              <div>
                <h3 className="font-semibold text-white">{note.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getBadgeClass(note.type)}>{getTypeLabel(note.type)}</Badge>
                  <span className="text-sm text-gray-400">
                    {new Date(note.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-300 whitespace-pre-wrap mt-3">{note.content}</p>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {note.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs border-gray-600 text-gray-400">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="ghost" size="icon" onClick={() => onEdit(note)} className="hover:bg-white/10">
              <Edit className="w-4 h-4 text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(note)} className="hover:bg-white/10">
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Notes;