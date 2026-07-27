'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { gamesService } from '../../services/games.service';
import { ModernCard } from '../ui/ModernCard';
import { Button } from '../ui/Button';
import styles from '../shared/panel.module.css';

// Déroule une session de quiz déjà démarrée (solo, duel ou défi quotidien —
// le mécanisme question/réponse/clôture est le même quelle que soit l'origine).
// `session` = { sessionId, questions } tel que renvoyé par startSession /
// startDailyChallenge / createDuel / joinDuel. `onFinished(summary)` est
// appelé avec le résultat de endSession une fois la dernière question passée.
export function QuizPlayer({ session, onFinished }) {
  const [index, setIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const question = session.questions[index];
  const isLast = index === session.questions.length - 1;

  const answer = async (choiceId) => {
    if (submitting || feedback) return;
    setSubmitting(true);
    setSelectedChoice(choiceId);
    setError('');
    try {
      const res = await gamesService.submitAnswer(session.sessionId, { questionId: question.id, choiceId });
      setFeedback(res.data);
      setScore((s) => s + res.data.pointsEarned);
    } catch (err) {
      setError(err.response?.data?.error || "Impossible d'enregistrer la réponse.");
    } finally {
      setSubmitting(false);
    }
  };

  const next = async () => {
    if (!isLast) {
      setFeedback(null);
      setSelectedChoice(null);
      setIndex((i) => i + 1);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await gamesService.endSession(session.sessionId);
      onFinished(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de clôturer la partie.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!question) {
    return (
      <div className={`${styles.card} ${styles.empty}`}>
        <p>Aucune question disponible pour cette partie.</p>
      </div>
    );
  }

  return (
    <ModernCard style={{ padding: 'var(--spacing-xl)' }}>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
      <p className="text-sm text-muted" style={{ marginTop: 0 }}>
        Question {index + 1} / {session.questions.length} · Score : {score}
      </p>
      <h2 style={{ marginTop: 0 }}>{question.prompt}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {question.choices.map((c) => {
          const isSelected = c.id === selectedChoice;
          const showCorrectness = !!feedback && isSelected;
          return (
            <button
              key={c.id}
              onClick={() => answer(c.id)}
              disabled={submitting || !!feedback}
              className="btn-secondary"
              style={{
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                borderColor: showCorrectness ? (feedback.isCorrect ? '#1f9d55' : '#d1495b') : undefined,
              }}
            >
              {c.text}
              {showCorrectness && (
                feedback.isCorrect
                  ? <CheckCircle2 size={18} color="#1f9d55" />
                  : <XCircle size={18} color="#d1495b" />
              )}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={styles.actions} style={{ marginTop: 'var(--spacing-lg)' }}>
          <Button onClick={next} isLoading={submitting}>{isLast ? 'Terminer' : 'Question suivante'}</Button>
        </div>
      )}
    </ModernCard>
  );
}
