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
          <h1 className="text-3xl font-bold mb-2">Practice Notes</h1>
          <p className="text-muted-foreground">
            Track practice observations, workouts, and nutrition
          </p>
        </div>
        <PracticeNoteDialog onClose={loadNotes} />
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>No Notes Yet</CardTitle>
                <CardDescription>
                  Start documenting your practice sessions, workouts, and nutrition
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Keep track of what you're working on, how you're feeling, and what you're learning. These notes help you reflect on your progress and identify patterns.
            </p>
            <PracticeNoteDialog onClose={loadNotes} />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Notes ({notes.length})</TabsTrigger>
            <TabsTrigger value="practice">Practice ({practiceNotes.length})</TabsTrigger>
            <TabsTrigger value="workout">Workouts ({workoutNotes.length})</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition ({nutritionNotes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={setDeleteNote} getIcon={getIcon} getTypeLabel={getTypeLabel} />
            ))}
          </TabsContent>

          <TabsContent value="practice" className="space-y-3">
            {practiceNotes.length > 0 ? (
              practiceNotes.map((note) => (
                <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={setDeleteNote} getIcon={getIcon} getTypeLabel={getTypeLabel} />
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No practice notes yet. Add one to get started!
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="workout" className="space-y-3">
            {workoutNotes.length > 0 ? (
              workoutNotes.map((note) => (
                <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={setDeleteNote} getIcon={getIcon} getTypeLabel={getTypeLabel} />
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No workout notes yet. Add one to get started!
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-3">
            {nutritionNotes.length > 0 ? (
              nutritionNotes.map((note) => (
                <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={setDeleteNote} getIcon={getIcon} getTypeLabel={getTypeLabel} />
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteNote?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                {getIcon(note.type)}
              </div>
              <div>
                <h3 className="font-semibold">{note.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{getTypeLabel(note.type)}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(note.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-3">{note.content}</p>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {note.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="ghost" size="icon" onClick={() => onEdit(note)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(note)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Notes;