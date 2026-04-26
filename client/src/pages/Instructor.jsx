import { useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { ImageReveal, ScrollSection, StaggerContainer, StaggerItem } from '../motion/ScrollBlock';
import { INSTRUCTOR_PAGE } from '../strings/vi';

export function Instructor() {
  const reduce = useReducedMotion() ?? false;

  return (
    <>
      <PageHeader title={INSTRUCTOR_PAGE.TITLE} crumbs={[{ label: INSTRUCTOR_PAGE.CRUMB, active: true }]} />
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <StaggerContainer reduced={reduce} className="text-center">
          <StaggerItem reduced={reduce}>
            <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">{INSTRUCTOR_PAGE.H2}</h2>
          </StaggerItem>
        </StaggerContainer>
        <StaggerContainer reduced={reduce} className="mx-auto mt-10 max-w-3xl text-left">
          <StaggerItem reduced={reduce}>
            <h3 className="font-display text-xl font-semibold">{INSTRUCTOR_PAGE.H3}</h3>
            <p className="mt-4 text-base-content/80">{INSTRUCTOR_PAGE.P1}</p>
            <p className="mt-4 text-base-content/80">{INSTRUCTOR_PAGE.P2}</p>
            <Button component={Link} to="/signup" variant="contained" color="primary" size="large" sx={{ mt: 3 }}>
              {INSTRUCTOR_PAGE.CTA}
            </Button>
          </StaggerItem>
        </StaggerContainer>
      </div>
      <div className="container mx-auto max-w-6xl px-4 pb-24 pt-4">
        <StaggerContainer reduced={reduce} className="grid items-center gap-10 md:grid-cols-2">
          <StaggerItem reduced={reduce}>
            <ImageReveal reduced={reduce}>
              <Box
                className="relative overflow-hidden rounded-2xl shadow-lg"
                sx={{ border: 1, borderColor: 'divider', aspectRatio: '4 / 3' }}
              >
                <Box component="img" src="/img/about.jpg" alt="" sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block' }} />
              </Box>
            </ImageReveal>
          </StaggerItem>
          <StaggerItem reduced={reduce}>
            <h2 className="font-display text-3xl font-bold text-primary">{INSTRUCTOR_PAGE.WHY}</h2>
            <p className="mt-4 text-base-content/80">{INSTRUCTOR_PAGE.WHY_P}</p>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </>
  );
}
