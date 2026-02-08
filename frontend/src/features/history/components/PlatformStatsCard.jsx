/**
 * Platform Stats Card
 * 
 * Displays statistics for a specific platform
 * 
 * @module features/history/components/PlatformStatsCard
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Visibility as ViewsIcon,
  ThumbUp as LikesIcon,
  Comment as CommentsIcon,
  Share as SharesIcon,
  TrendingUp as UpvotesIcon,
  OpenInNew as LinkIcon
} from '@mui/icons-material'

function PlatformStatsCard({ platform, telemetry, event }) {
  const { t } = useTranslation()

  // Get platform-specific metrics
  const getMetrics = () => {
    if (!telemetry || !telemetry.metrics) {
      return null
    }

    const m = telemetry.metrics
    const platformLower = platform.toLowerCase()

    switch (platformLower) {
      case 'reddit':
        return {
          views: m.views,
          upvotes: m.upvotes,
          downvotes: m.downvotes,
          comments: m.comments,
          score: m.score,
          upvoteRatio: m.upvoteRatio
        }
      
      case 'twitter':
      case 'x':
        return {
          views: m.tweetViews,
          likes: m.likes,
          retweets: m.retweets,
          replies: m.replies,
          quoteTweets: m.quoteTweets
        }
      
      case 'facebook':
        return {
          views: m.postViews,
          reactions: m.reactions,
          comments: m.comments,
          shares: m.shares
        }
      
      case 'instagram':
        return {
          likes: m.instagramLikes,
          comments: m.instagramComments,
          views: m.instagramViews
        }
      
      case 'linkedin':
        return {
          views: m.linkedInViews,
          reactions: m.linkedInReactions,
          comments: m.linkedInComments,
          shares: m.linkedInShares
        }
      
      case 'email':
        return {
          sent: m.emailsSent,
          delivered: m.emailsDelivered,
          opened: m.emailsOpened,
          clicked: m.emailsClicked,
          openRate: m.openRate,
          clickRate: m.clickRate,
          bounces: m.bounces,
          unsubscribes: m.unsubscribes
        }
      
      default:
        return null
    }
  }

  const metrics = getMetrics()
  const hasMetrics = metrics && Object.values(metrics).some(v => v !== undefined && v !== null && v !== 0)

  // Format number
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '-'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  // Format percentage
  const formatPercent = (num) => {
    if (num === undefined || num === null) return '-'
    return `${num.toFixed(1)}%`
  }

  if (!telemetry) {
    return (
      <Alert severity="info">
        {t('history.noTelemetry', { defaultValue: 'No telemetry data available for this platform' })}
      </Alert>
    )
  }

  if (!telemetry.available) {
    return (
      <Alert severity="warning">
        {telemetry.error || t('history.telemetryUnavailable', { defaultValue: 'Telemetry not available for this platform' })}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {platform.charAt(0).toUpperCase() + platform.slice(1)} {t('history.statistics', { defaultValue: 'Statistics' })}
        </Typography>
        {telemetry.url && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<LinkIcon />}
            href={telemetry.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('history.viewPost', { defaultValue: 'View Post' })}
          </Button>
        )}
      </Box>

      {/* Last Updated */}
      {telemetry.lastUpdated && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          {t('history.lastUpdated', { defaultValue: 'Last updated' })}: {new Date(telemetry.lastUpdated).toLocaleString()}
        </Typography>
      )}

      {/* Metrics */}
      {hasMetrics ? (
        <Grid container spacing={2}>
          {metrics.views !== undefined && (
            <Grid item xs={6} sm={4} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <ViewsIcon color="primary" sx={{ mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(metrics.views)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('history.views', { defaultValue: 'Views' })}
                </Typography>
              </Paper>
            </Grid>
          )}
          
          {metrics.likes !== undefined && (
            <Grid item xs={6} sm={4} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <LikesIcon color="primary" sx={{ mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(metrics.likes)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('history.likes', { defaultValue: 'Likes' })}
                </Typography>
              </Paper>
            </Grid>
          )}

          {metrics.upvotes !== undefined && (
            <Grid item xs={6} sm={4} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <UpvotesIcon color="primary" sx={{ mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(metrics.upvotes)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('history.upvotes', { defaultValue: 'Upvotes' })}
                </Typography>
              </Paper>
            </Grid>
          )}

          {metrics.comments !== undefined && (
            <Grid item xs={6} sm={4} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CommentsIcon color="primary" sx={{ mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(metrics.comments)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('history.comments', { defaultValue: 'Comments' })}
                </Typography>
              </Paper>
            </Grid>
          )}

          {metrics.shares !== undefined && (
            <Grid item xs={6} sm={4} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <SharesIcon color="primary" sx={{ mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(metrics.shares)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('history.shares', { defaultValue: 'Shares' })}
                </Typography>
              </Paper>
            </Grid>
          )}

          {metrics.retweets !== undefined && (
            <Grid item xs={6} sm={4} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <SharesIcon color="primary" sx={{ mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(metrics.retweets)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('history.retweets', { defaultValue: 'Retweets' })}
                </Typography>
              </Paper>
            </Grid>
          )}

          {metrics.reactions !== undefined && (
            <Grid item xs={6} sm={4} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <LikesIcon color="primary" sx={{ mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(metrics.reactions)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('history.reactions', { defaultValue: 'Reactions' })}
                </Typography>
              </Paper>
            </Grid>
          )}

          {metrics.openRate !== undefined && (
            <Grid item xs={6} sm={4} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <ViewsIcon color="primary" sx={{ mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatPercent(metrics.openRate)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('history.openRate', { defaultValue: 'Open Rate' })}
                </Typography>
              </Paper>
            </Grid>
          )}

          {metrics.clickRate !== undefined && (
            <Grid item xs={6} sm={4} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <LinkIcon color="primary" sx={{ mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatPercent(metrics.clickRate)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('history.clickRate', { defaultValue: 'Click Rate' })}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      ) : (
        <Alert severity="info">
          {t('history.noMetrics', { defaultValue: 'No metrics available yet' })}
        </Alert>
      )}
    </Box>
  )
}

export default PlatformStatsCard
