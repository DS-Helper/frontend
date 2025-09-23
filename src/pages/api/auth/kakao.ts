import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Authorization code is required' });
  }

  try {
    // 카카오 액세스 토큰 요청
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID!,
        redirect_uri: process.env.KAKAO_REDIRECT_URI || 'http://localhost:8080/oauth/kakao/login',
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }

    // 카카오 사용자 정보 요청
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      throw new Error('Failed to get user information');
    }

    // 임시로 프론트엔드에서 토큰 생성 (실제로는 백엔드에서 처리해야 함)
    const tempToken = `kakao_${userData.id}_${Date.now()}`;
    
    // 성공 응답
    res.status(200).json({
      token: tempToken,
      user: {
        id: userData.id,
        email: userData.kakao_account?.email,
        nickname: userData.kakao_account?.profile?.nickname,
        profileImage: userData.kakao_account?.profile?.profile_image_url,
        provider: 'kakao'
      },
    });

  } catch (error) {
    console.error('Kakao login error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
