import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAuthUserFromRequest, toPublicUser } from '@/lib/auth';
import {
  getAllUsers,
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  approveCertificate,
  rejectCertificate,
} from '@/lib/db';
import { UserCategory, AwardLevel } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const caller = await getAuthUserFromRequest(request);
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const isHostOrCoord =
      caller.category === 'ADMIN' ||
      caller.category === 'EVENT_COORDINATOR' ||
      caller.role === 'admin' ||
      caller.role === 'super_admin';

    if (!isHostOrCoord) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const eventScope = (caller.assignedEvent || caller.presentedOn || '').trim().toLowerCase();
    const allUsers = await getAllUsers();

    // Event-wise strict isolation: only return users registered under this host's event
    const eventUsers = allUsers
      .filter((u) => {
        if (u.email.toLowerCase() === 'info@aveeranex.com') return false;
        if (u.id === caller.id) return false;
        if (!eventScope) return true; // if host has no event, show all
        const userEvent = (u.assignedEvent || u.presentedOn || '').trim().toLowerCase();
        return userEvent === eventScope || userEvent.includes(eventScope) || eventScope.includes(userEvent);
      })
      .map(toPublicUser);

    const participants = eventUsers.filter((u) => (u.category || 'PARTICIPANT') === 'PARTICIPANT');
    const submissions = participants.filter((p) => Boolean(p.submissionFileUrl || p.submissionGithubUrl || p.submittedAt));
    
    // Leaderboard sorted by rank (if set) then by score descending
    const leaderboard = [...participants].sort((a, b) => {
      if (a.leaderboardRank && b.leaderboardRank) return a.leaderboardRank - b.leaderboardRank;
      if (a.leaderboardRank) return -1;
      if (b.leaderboardRank) return 1;
      return (b.leaderboardScore || 0) - (a.leaderboardScore || 0);
    });

    return NextResponse.json({
      eventName: caller.assignedEvent || caller.presentedOn || 'My Hosted Event',
      event: {
        name: caller.assignedEvent || caller.presentedOn || 'My Hosted Event',
        rounds: caller.eventRounds || '3 Rounds (Round 1: Abstract & PPT, Round 2: Prototype, Round 3: Grand Finale)',
        dates: caller.eventDates || 'Upcoming',
        prizes: caller.eventPrizes || '1st: ₹50,000 | 2nd: ₹25,000 | 3rd: ₹10,000',
        bannerUrl: caller.eventBannerUrl || '',
        description: caller.eventDescription || '',
        approved: Boolean(caller.eventApproved),
        isLeaderboardPublished: Boolean(caller.isLeaderboardPublished),
      },
      users: eventUsers,
      participants,
      submissions,
      leaderboard,
    });
  } catch (error) {
    console.error('Event subplatform GET error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const caller = await getAuthUserFromRequest(request);
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const isHostOrCoord =
      caller.category === 'ADMIN' ||
      caller.category === 'EVENT_COORDINATOR' ||
      caller.role === 'admin' ||
      caller.role === 'super_admin';

    if (!isHostOrCoord) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;
    const hostEventName = caller.assignedEvent || caller.presentedOn || "AVEERANEX INNOVATE - NOV'26";

    // 1. UPDATE EVENT CONFIGURATION
    if (action === 'UPDATE_EVENT') {
      const { name, rounds, dates, prizes, bannerUrl, description, isLeaderboardPublished } = body;
      const updatedCaller = await updateUser(caller.id, {
        assignedEvent: name?.trim() || hostEventName,
        presentedOn: name?.trim() || hostEventName,
        eventRounds: rounds?.trim(),
        eventDates: dates?.trim(),
        eventPrizes: prizes?.trim(),
        eventBannerUrl: bannerUrl?.trim(),
        eventDescription: description?.trim(),
        isLeaderboardPublished: isLeaderboardPublished !== undefined ? Boolean(isLeaderboardPublished) : caller.isLeaderboardPublished,
      });

      return NextResponse.json({
        message: 'Event space configuration updated successfully!',
        user: updatedCaller ? toPublicUser(updatedCaller) : null,
      });
    }

    // 2. REVIEW & APPROVE PPT / ADVANCE SUBMISSION ROUND
    if (action === 'REVIEW_SUBMISSION') {
      const { userId, submissionStatus, submissionRound, submissionFeedback } = body;
      const target = await getUserById(userId);
      if (!target) {
        return NextResponse.json({ error: 'Participant not found.' }, { status: 404 });
      }

      const updated = await updateUser(userId, {
        submissionStatus: submissionStatus || 'ROUND_1_APPROVED',
        submissionRound: submissionRound || target.submissionRound || 'Round 2: Prototype & Code',
        submissionFeedback: submissionFeedback || 'Submission approved by Event Coordinator.',
      });

      return NextResponse.json({
        message: `Submission status for ${target.name} updated to "${submissionStatus || 'ROUND_1_APPROVED'}"!`,
        user: updated ? toPublicUser(updated) : null,
      });
    }

    // 3. SCORE PARTICIPANT / EVALUATE FOR LEADERBOARD
    if (action === 'SCORE_PARTICIPANT') {
      const {
        userId,
        scoreInnovation,
        scoreTechnical,
        scorePresentation,
        scoreImpact,
        leaderboardScore,
        leaderboardRank,
        isFinalist,
      } = body;

      const target = await getUserById(userId);
      if (!target) {
        return NextResponse.json({ error: 'Participant not found.' }, { status: 404 });
      }

      const calcTotal =
        leaderboardScore !== undefined
          ? Number(leaderboardScore)
          : Number(scoreInnovation || 0) +
            Number(scoreTechnical || 0) +
            Number(scorePresentation || 0) +
            Number(scoreImpact || 0);

      const updated = await updateUser(userId, {
        scoreInnovation: scoreInnovation !== undefined ? Number(scoreInnovation) : target.scoreInnovation,
        scoreTechnical: scoreTechnical !== undefined ? Number(scoreTechnical) : target.scoreTechnical,
        scorePresentation: scorePresentation !== undefined ? Number(scorePresentation) : target.scorePresentation,
        scoreImpact: scoreImpact !== undefined ? Number(scoreImpact) : target.scoreImpact,
        leaderboardScore: calcTotal,
        leaderboardRank: leaderboardRank !== undefined ? Number(leaderboardRank) : target.leaderboardRank,
        isFinalist: isFinalist !== undefined ? Boolean(isFinalist) : target.isFinalist,
        submissionStatus: isFinalist ? 'FINALIST' : target.submissionStatus,
      });

      return NextResponse.json({
        message: `Evaluation score saved for ${target.name} (Total: ${calcTotal}/100, Rank: ${leaderboardRank || 'Unranked'})!`,
        user: updated ? toPublicUser(updated) : null,
      });
    }

    // 4. TOGGLE PUBLISH LIVE LEADERBOARD
    if (action === 'TOGGLE_LEADERBOARD') {
      const { publish } = body;
      const isPublished = Boolean(publish);
      await updateUser(caller.id, {
        isLeaderboardPublished: isPublished,
      });

      return NextResponse.json({
        message: isPublished
          ? 'Live Leaderboard has been published for all participants!'
          : 'Live Leaderboard has been set to private draft.',
        isLeaderboardPublished: isPublished,
      });
    }

    // 5. BULK ONBOARD PARTICIPANTS (CSV / MULTI-LINE)
    if (action === 'BULK_ONBOARD_PARTICIPANTS') {
      const { rawData } = body;
      if (!rawData || typeof rawData !== 'string') {
        return NextResponse.json({ error: 'Please provide CSV or multi-line participant data.' }, { status: 400 });
      }

      const lines = rawData
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);

      const defaultPassword = await bcrypt.hash('Aveeranex@2026', 10);
      const createdUsers = [];
      const skippedEmails = [];

      for (const line of lines) {
        // format: Name, Email, Contact, TeamName, TopicTitle
        const parts = line.split(/[,;\t|]+/).map((p: string) => p.trim());
        if (parts.length < 2) continue;

        const name = parts[0];
        const email = parts[1].toLowerCase();
        const contact = parts[2] || '+91 9876543210';
        const teamName = parts[3] || `${name}'s Team`;
        const topicTitle = parts[4] || 'AI & Cloud Hackathon Project';

        if (!email.includes('@')) continue;

        const existing = await getUserByEmail(email);
        if (existing) {
          skippedEmails.push(email);
          continue;
        }

        try {
          const user = await createUser({
            name,
            email,
            contact,
            teamName,
            topicTitle,
            topicDomain: 'AI / Machine Learning',
            college: caller.organization || caller.college || 'Enrolled Institution',
            location: 'India',
            state: 'India',
            country: 'India',
            presentedOn: hostEventName,
            assignedEvent: hostEventName,
            passwordHash: defaultPassword,
            role: 'user',
            category: 'PARTICIPANT',
            awardLevel: 'PARTICIPATION',
            submissionRound: 'Round 1: Abstract & PPT',
            submissionStatus: 'PENDING_REVIEW',
          });
          createdUsers.push(toPublicUser(user));
        } catch (e) {
          console.error('Error creating participant:', email, e);
        }
      }

      return NextResponse.json({
        message: `Successfully onboarded ${createdUsers.length} participants to "${hostEventName}"!${
          skippedEmails.length > 0 ? ` (${skippedEmails.length} existing emails skipped)` : ''
        }`,
        createdCount: createdUsers.length,
        skippedCount: skippedEmails.length,
      });
    }

    // 6. SINGLE ONBOARD MEMBER (Participant, Mentor, Coordinator)
    if (action === 'ONBOARD') {
      const { name, email, contact, category, organization, designation, specialization, technicalResponsibility, teamName, topicTitle } = body;
      if (!name?.trim() || !email?.trim() || !category) {
        return NextResponse.json({ error: 'Name, Email, and Role Category are required.' }, { status: 400 });
      }

      const existing = await getUserByEmail(email.trim());
      if (existing) {
        return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
      }

      const defaultPassword = await bcrypt.hash('Aveeranex@2026', 10);
      const isParticipant = category === 'PARTICIPANT';

      const created = await createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        contact: contact?.trim() || 'N/A',
        passwordHash: defaultPassword,
        role: 'user',
        category: category as UserCategory,
        presentedOn: hostEventName,
        assignedEvent: hostEventName,
        organization: organization?.trim() || caller.organization || caller.college,
        college: organization?.trim() || caller.college || caller.organization,
        designation: designation?.trim() || (isParticipant ? undefined : 'Event Evaluator'),
        specialization: specialization?.trim(),
        technicalResponsibility: technicalResponsibility?.trim(),
        teamName: isParticipant ? (teamName?.trim() || `${name.trim()}'s Team`) : undefined,
        topicTitle: isParticipant ? (topicTitle?.trim() || 'Hackathon Project Presentation') : undefined,
        topicDomain: isParticipant ? 'AI / Machine Learning' : undefined,
        awardLevel: 'PARTICIPATION',
        submissionRound: isParticipant ? 'Round 1: Abstract & PPT' : undefined,
        submissionStatus: isParticipant ? 'PENDING_REVIEW' : undefined,
      });

      return NextResponse.json({
        message: `${name} onboarded to "${hostEventName}" successfully!`,
        user: toPublicUser(created),
      });
    }

    // 7. APPROVE INDIVIDUAL CERTIFICATE WITH AWARD LEVEL
    if (action === 'APPROVE') {
      const { userId, awardLevel, includeParticipationToo, awardOrientation, runnerTheme } = body;
      const target = await getUserById(userId);
      if (!target) {
        return NextResponse.json({ error: 'Recipient not found.' }, { status: 404 });
      }

      const updated = await approveCertificate(
        userId,
        caller.name,
        (awardLevel as AwardLevel) || 'PARTICIPATION',
        includeParticipationToo !== undefined ? Boolean(includeParticipationToo) : true,
        awardOrientation || caller.certOrientation || 'landscape',
        runnerTheme || caller.runnerTheme || 'white'
      );
      return NextResponse.json({
        message: `Verified certificate (${awardLevel || 'PARTICIPATION'}) approved for ${target.name}!`,
        user: updated ? toPublicUser(updated) : null,
      });
    }

    // 8. BULK APPROVE ALL VERIFIED PARTICIPANTS
    if (action === 'BULK_APPROVE') {
      const { userIds, awardLevel } = body;
      const allUsers = await getAllUsers();
      const targetIds: string[] = userIds || allUsers
        .filter((u) => {
          const userEvent = (u.assignedEvent || u.presentedOn || '').trim().toLowerCase();
          return userEvent === hostEventName.trim().toLowerCase() && (u.category || 'PARTICIPANT') === 'PARTICIPANT';
        })
        .map((u) => u.id);

      let approvedCount = 0;
      for (const uid of targetIds) {
        try {
          await approveCertificate(
            uid,
            caller.name,
            (awardLevel as AwardLevel) || 'PARTICIPATION',
            true,
            caller.certOrientation || 'landscape',
            caller.runnerTheme || 'white'
          );
          approvedCount++;
        } catch (e) {
          console.error('Error approving user:', uid, e);
        }
      }

      return NextResponse.json({
        message: `Successfully approved certificates for ${approvedCount} participants!`,
        approvedCount,
      });
    }

    // 9. REJECT CERTIFICATE
    if (action === 'REJECT') {
      const { userId, reason } = body;
      const updated = await rejectCertificate(userId, reason || 'Did not meet event evaluation criteria.');
      return NextResponse.json({
        message: 'Certificate request declined with reviewer remarks.',
        user: updated ? toPublicUser(updated) : null,
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Event subplatform POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
