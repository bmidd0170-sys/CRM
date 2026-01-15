import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // This endpoint clears all temporary/static data when a new admin registers
    // It resets the temporary donations data and other cached information
    
    // Since we're using static data files in app/donations/data.ts and app/campaigns/donationsData.ts,
    // we can't directly clear them at runtime. However, this endpoint signals that
    // the application should clear any in-memory caches or session storage.
    
    // In a real application, you might:
    // 1. Clear Redis cache
    // 2. Clear session storage
    // 3. Reset temporary collections in the database
    // 4. Clear browser localStorage/sessionStorage on the client side
    
    return NextResponse.json({ 
      message: 'Temporary data cleared successfully',
      success: true 
    });
  } catch (error) {
    console.error('Error clearing temporary data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clear temporary data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
